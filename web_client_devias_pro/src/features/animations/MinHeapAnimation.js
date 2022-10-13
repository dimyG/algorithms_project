import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3"
import {
  Box,
  Button,
  Card, CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  makeStyles,
  SvgIcon,
  TextField, Typography, Link
} from "@material-ui/core";
import {Play as PlayIcon, Pause as PauseIcon, FastForward as FastForwardIcon, RefreshCw as RefreshCwIcon} from "react-feather";
import Page from "../../components/Page";
import { useTheme } from "@material-ui/core/styles";
import _ from "lodash";

class Queue {
  constructor(items = []) {
    this.items = items
  }
  enqueue = item => {
    return this.items.push(item)
  }
  dequeue = () => {
    return this.items.shift()
  }
  isEmpty = () => {
    return this.items.length === 0
  }
}

class DataItems {
  // todo think the case of millions of items, remove sorting and iterating through all items
  constructor(items = [], frameQueue = new Queue(), heap = null) {
    this.items = items
    this.frameQueue = frameQueue
  }

  // O(m) space complexity, where m is the number if attributes in the item
  enqueueFrame = (frameData = this.items) => {
    // A frame is the array of items (items have new coordinates in each frame).
    // console.log("  enqueueing frame:", frameData)
    this.frameQueue.enqueue(_.cloneDeep(frameData))  // enqueued data should not change. They should not be references [...frameData] also works
  }

  // O(1) time complexity
  swap = (index1, index2) => {
    // An item changes position if its x and y coordinates change
    if (index1 === -1 || index2 === -2) return
    let item1 = this.items[index1]
    let item2 = this.items[index2]
    // this change improves time complexity from O(n) to O(1)
    this.items[index1] = {...item2, value: item1.value, id: item1.id}
    this.items[index2] = {...item1, value: item2.value, id: item2.id}
    this.enqueueFrame()
    // console.log("  all items After swap:", this.items)
  }

  moveRight = (step = iterationXStep) => {
    // move all non heap items to the right by changing their x coordinate
    this.items = this.items.map((item, index) => {
      if (!item.heapIndex) return {...item, x: item.x + step}
      return {...item}
    })
    this.enqueueFrame()
  }

  reheap = ( itemIndex) => {
    // itemIndex: the index of the item that was just swapped inwards. We want to see if it needs to be swapped again
    // todo use the item.heapIndex property to avoid sorting
    const sortedHeapItems = this.heapItemsSortedByIndex()  // avoid sorting
    const item = this.items[itemIndex]
    // const item = this.items.filter((item) => item.heapIndex = heapIndex+1)[0]
    // console.log("  reheaping item:", item)
    const smallerKid = this.getKidForSwap(item, sortedHeapItems)
    if (!smallerKid) return  // item has no kids
    const smallerKidIndex = this.items.indexOf(smallerKid)  // temporary solution
    this.swap(itemIndex, smallerKidIndex)
    // "reheap" again starting from the swapped item that took the place of the child
    this.reheap(itemIndex)  // have in mind that currently the heapIndex property starts from 1 not 0
  }

  isCompareItem = (index) => {
    if (index < 0) return false  // if all items have been compared
    // console.log("Items:", this.items)
    let heapHead = this.heapHead()
    let item = this.items[index]
    // console.log("isCompareItem index:", index, "compareItem:", item)
    return (!item.heapIndex && Math.abs(item.x - heapHead.x) < 1)
  }

  heapItems = () => {
    // get the items that belong to the heap
    return this.items.filter(item => item.heapIndex)
  }

  nonHeapItems = () => {
    return this.items.filter(item => !item.heapIndex)
  }

  heapItemsSortedByIndex = (items = this.heapItems()) => {
    return items.sort((a, b) => {
      return a.heapIndex - b.heapIndex
    })
  }

  itemByCoords = (x, y) => {
    // get the first Item with the given coordinates
    return this.items.filter(item => item.x === x && item.y === y)[0]
  }

  heapHead = () => {
    return this.itemByCoords(heapHeadX, heapHeadY)
  }

  heapHeadIndex = () => {
    const heapHead = this.heapHead()
    return this.items.indexOf(heapHead)
  }

  itemIndexFromHeapIndex = (heapIndex) => {
    return this.items.length + heapIndex
  }

  itemKids = (heapItem, sortedHeapItems=this.heapItemsSortedByIndex()) => {
    const itemHeapIndex = heapItem.heapIndex-1
    const kid1Index = this.kid1Index(itemHeapIndex)
    const kid2Index = this.kid2Index(itemHeapIndex)
    if (this.hasKids(itemHeapIndex)) {
      // if you are on nodes that have kids
      // console.log("kid2Index index", kid2Index)
      return [sortedHeapItems[kid1Index], sortedHeapItems[kid2Index]]
    }
    // console.log("  item:", heapItem, "has no kids")
  }

  itemKidsSorted = (heapItem, sortedHeapItems=this.heapItemsSortedByIndex()) => {
    const kids = this.itemKids(heapItem, sortedHeapItems)
    if (!kids) return
    return kids.sort((a, b) => {
      return a.value - b.value
    })
  }

  getKidForSwap = (heapItem, sortedHeapItems=this.heapItemsSortedByIndex()) => {
    const sortedKids = this.itemKidsSorted(heapItem, sortedHeapItems)
    if (!sortedKids) return
    for (const kid of sortedKids){
      if (heapItem.value > kid.value) return kid
    }
  }

  heapsLastIndex = () => this.heapItems().length - 1

  kid1Index = heapIndex => heapIndex * 2 + 1

  kid2Index = heapIndex => this.kid1Index(heapIndex) + 1

  hasKids = heapIndex => {
    // if the items first kid index is less than the last index of the heap, then the item has kids
    return this.kid1Index(heapIndex) <= this.heapsLastIndex()
  }

  parentIndex = heapIndex => Math.floor(Math.abs(heapIndex - 1) * 0.5)

  firstNonHeapItem = () => {
    const nonHeapItems = this.nonHeapItems()
    // const sorted = nonHeapItems.sort((a, b) => a.x - b.x)
    return nonHeapItems[0]
  }

  isFullyAnimated = () => {
    // The first nonHeapItem has the smallest X coordinate so it is the furthest one on the left. If it is greater
    // than the viewBox width, then it has been moved completely on the left and all items have been processed.
    return this.firstNonHeapItem().x > svgViewBoxWidth
  }

}

const numbersLength = 20
const generateRandomArray = (length, maxValue) => [...new Array(length)].map(() => Math.round(Math.random() * maxValue));
const randomNumbers = generateRandomArray(numbersLength, 100)

const svgViewBoxWidth = 100
const svgViewBoxHeight = 45
const heapHeadX = svgViewBoxWidth * 0.5
const heapHeadY = svgViewBoxHeight * 0.55
const circleRadius = svgViewBoxWidth * 0.05
const heapCircleRadius = circleRadius * 0.9
const circleTextSize = circleRadius * 0.8
const itemsXDistance = circleRadius * 2.5
const iterationXStep = itemsXDistance
const heapItemsDistance = itemsXDistance * 0.7
// const lastItemX = heapHeadX - stepRight
const firstItemX = heapHeadX - iterationXStep * numbersLength  // so that the last item is one step before the heap head
const firstItemY = heapHeadY + 2.1 * circleRadius

// *2 since there are (at most) two animations for each item (move right and compare)
// +1 since the last item is 1 step from heap head, and +2 to continue 2 steps after all items have been compared with heap head
const maxIterations = numbersLength * 2 + 1 + 2
const heapSize = 7

const initialNumberItems = Array(numbersLength).fill(0).map((item, index) => ({
  // the id is needed so that every item object is unique (and items.indexOf(item) returns always the unique item's index)
  id: index +1, x: firstItemX + index * itemsXDistance, y: firstItemY, parent: null, value: randomNumbers[index], heapIndex: null
}))

const initialHeapItems = [
  {id: initialNumberItems.length+1, x: heapHeadX, y: heapHeadY, value: 0, heapIndex: 1},
  {id: initialNumberItems.length+2, x: heapHeadX-heapItemsDistance*1.3, y: heapHeadY-heapItemsDistance, value: 0, heapIndex: 2},
  {id: initialNumberItems.length+3, x: heapHeadX+heapItemsDistance*1.3, y: heapHeadY-heapItemsDistance, value: 0, heapIndex: 3},
  {id: initialNumberItems.length+4, x: heapHeadX-heapItemsDistance*1.3-circleRadius*1.1, y: heapHeadY-heapItemsDistance*2.2, value: 0, heapIndex: 4},
  {id: initialNumberItems.length+5, x: heapHeadX-heapItemsDistance*1.3+circleRadius*1.1, y: heapHeadY-heapItemsDistance*2.2, value: 0, heapIndex: 5},
  {id: initialNumberItems.length+6, x: heapHeadX+heapItemsDistance*1.3-circleRadius*1.1, y: heapHeadY-heapItemsDistance*2.2, value: 0, heapIndex: 6},
  {id: initialNumberItems.length+7, x: heapHeadX+heapItemsDistance*1.3+circleRadius*1.1, y: heapHeadY-heapItemsDistance*2.2, value: 0, heapIndex: 7},
]

const createInitialHeapItems = (heapSize) => {
  // generate initial heap items for a given heap size
  let items = []
  let x, y
  for (let i=0; i<heapSize; i++){
    let layer  // the layer of the heap (make it a function)
    for (let exp = 0; ; exp++) {
      // console.log("exp:", exp, "i+1/2**exp", i+1/2**exp, "i+1/Math.abs(2**(exp+1))", i+1/Math.abs(2**(exp+1)))
      // if (i/2**exp >= 1 && i/2**(exp+1) < 2 || i === 0) {
      if (2**exp <= i+1 && 2**(exp+1) > i+1 || i === 0) {
        layer = exp + 1
        break
      }
    }
    if (i === 0) {
      x = heapHeadX
      y = heapHeadY
    } else {
      const XDistance = i % 2 === 0 ? heapItemsDistance : - heapItemsDistance
      const YDistance = heapItemsDistance
      const parentIndex = Math.floor(Math.abs(i - 1) * 0.5)
      // todo kid nodes X coordinate isn't calculated properly. Currently they overlap
      x = items[parentIndex].x + XDistance * (1 - (layer - 1) / (5 - 1))
      y = items[parentIndex].y - YDistance
    }
    console.log("index:", i, "layer", layer)
    items.push({
      id: initialNumberItems.length+1, x: x, y: y, value: 0, heapIndex: i+1
    })
    console.log(items)
  }
  return items
}

const initialItems = initialNumberItems.concat(initialHeapItems)

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  action: {
    marginBottom: theme.spacing(1),
    '& + &': {
      marginLeft: theme.spacing(1)
    },
    minWidth: 100,
    '@media (max-width:420px)': {
      minWidth: 70,
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5)
    },
    // another way to control css properties based on size, is by using the built in theme's breakpoints
    // material's UI xs breakpoint is 0-600 px so it doesn't fit for this case.
    // [theme.breakpoints.down('xs')]: {
    //   minWidth: 70,
    // },

    // from the element with class action, select the children elements with class SvgIcon
    '& .SvgIcon': {
      fontSize: '1.2rem',
      '@media (max-width:420px)': {
        fontSize: '0.8rem',
      }
    }
  },
}));

const MinHeapAnimation = () => {
  // the first item to be checked for comparison with the heap head, is the last item of the array
  const initialCompareItemIndex = initialNumberItems.length - 1
  const classes = useStyles()
  const [frame, setFrame] = useState(initialItems)
  const [heapData, setHeapData] = useState(initialHeapItems)
  // Maybe use dataItems.items as state and rerender the component whenever dataItems.items change?
  // Notice that if an object of the dataItems.items array changes, the items array itself doesn't
  const [dataItems, setDataItems] = useState(new DataItems(initialItems))
  const [speedMode, setSpeedMode] = useState("Fast")
  const [inPlayMode, setInPlayMode] = useState(false)
  const [currentIterationFinished, setCurrentIterationFinished] = useState(true)
  const [compareItemIndex, setCompareItemIndex] = useState(initialCompareItemIndex)
  // const [numIterations, setNumIterations] = useState(0)
  const theme = useTheme()
  const ref = useRef()

  const isFullyAnimated = dataItems.isFullyAnimated()

  useEffect(() => {

    const circlesTheme = theme.heapCirclesTheme

    const svgElement = d3.select(ref.current)

    const lines = svgElement.selectAll("line")
      .data(initialHeapItems)
      .enter()
      .append("line")

    lines
      .attr("x1", d => d.x)
      .attr("y1", d => d.y)
      .attr("x2", d => {
        const parentIndex = dataItems.parentIndex(d.heapIndex-1)
        return initialHeapItems[parentIndex].x
      })
      .attr("y2", d => {
        const parentIndex = dataItems.parentIndex(d.heapIndex-1)
        return initialHeapItems[parentIndex].y
      })
      .attr("stroke", circlesTheme.lineStroke)
      .attr("stroke-width", 0.1)

    svgElement.selectAll("circle.numberCircle")
      .data(frame)
      .join("circle")
      .transition().duration(frameTransitionDuration)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r",  circleRadius)
      .attr("class", "numberCircle")
      // .style("stroke", "red")
      // .style("stroke-width", .01)
      .style("fill-opacity", circlesTheme.circleFillOpacity)
      .style("fill", circlesTheme.circleFill)

    svgElement.selectAll("text.numberValue")
      .data(frame)
      .join("text")
      .transition().duration(frameTransitionDuration)
      .attr("dx", d => d.x)
      .attr("dy", d => d.y+circleTextSize/4)
      .attr("text-anchor", "middle")
      .attr("class", "numberValue")
      .text(d => d.value)
      .attr('font-size', circleTextSize)
      .style('fill', circlesTheme.circleTextFill)

    svgElement.selectAll("circle.heapCircle")
      .data(heapData)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r",  heapCircleRadius)
      .attr("class", "heapCircle")
      // .style("stroke", "blue")
      // .style("stroke-width", 0.2)
      .style("fill-opacity", circlesTheme.heapCircleFillOpacity)
      .style("fill", circlesTheme.heapCircleFill)

    // Notice that one iteration can contain more than one animation frames. This means that the effect will run
    // for each frame within the same iteration. In these cases we don't want to reiterate. We only want to reiterate
    // when the previous iteration has finished.
    if (!isFullyAnimated && inPlayMode && currentIterationFinished) moveItems(dataItems, compareItemIndex)

  }, [
    frame, heapData, inPlayMode, currentIterationFinished,
    theme.name,  // theme.name so that every time the theme changes the effect runs and new circlesTheme is used
  ])

  const initialize = () => {
    setFrame(initialItems)
    setHeapData(initialHeapItems)
    setDataItems(new DataItems(initialItems))
    setInPlayMode(false)
    setCurrentIterationFinished(true)
    setCompareItemIndex(initialCompareItemIndex)
    // setNumIterations(0)
  }

  const speedOptions = ["Slow", "Normal", "Fast", "Super Fast"]
  // const playModeOptions = ["Playing", "Paused"]
  const playButtonText = inPlayMode ? "Pause" : "Play"

  let frameTransitionDuration = 350

  if (speedMode === "Slow"){
    frameTransitionDuration = 1000
  } else if (speedMode === "Normal"){
    frameTransitionDuration = 600
  } else if (speedMode === "Fast"){
    frameTransitionDuration = 350
  } else if (speedMode === "Super Fast"){
    frameTransitionDuration = 150
  }

  const generateCurrentStepFrames = (dataItems, compareItemIndex) => {
    // we use the compareItemIndex to get directly the current compare item instead of looping through the items array
    // this improves time complexity from O(n) to O(1)
    // const dataItems = new DataItems(prevItems)
    let heapHeadIndex = dataItems.heapHeadIndex()
    let heapHead = dataItems.items[heapHeadIndex]
    if (dataItems.isCompareItem(compareItemIndex)) {
      // if the current item is next to the heap head, move the pointer (the iterFromIndex)
      // to the next item to check for comparison (which is the previous one in the list)
      setCompareItemIndex(prevIndex => {
        let newIndex = prevIndex - 1
        if (newIndex < 0) newIndex = 0
        return newIndex
      })
      const item = dataItems.items[compareItemIndex]
      if (item.value > heapHead.value) {
        // console.log("pushing item to heap")
        dataItems.swap(compareItemIndex, heapHeadIndex)
        dataItems.reheap(compareItemIndex)
        return dataItems.frameQueue
      }
    }
    dataItems.moveRight()
    return dataItems.frameQueue
  }

  const delay = ms => {
    // console.log("  delaying for:", ms)
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const animateQueue = async (frameQueue) => {
    // animate all frames of the queue, waiting between every frame so that d3 completes the animation
    if (!frameQueue.isEmpty()){
      const nextFrame = frameQueue.dequeue()
      setFrame(nextFrame)
      // if (frameQueue.isEmpty()) return
      await delay(frameTransitionDuration * 1.1)  // wait for the d3 frames transition to be completed
      // debugger
      await animateQueue(frameQueue)
    }
    // if (!play) throw "error"
  }

  const moveItems = async (dataItems, compareItemIndex) => {
    setCurrentIterationFinished(false)
    console.log("Iterating...")
    // setNumIterations(prevCount => prevCount + 1)
    const frameQueue = generateCurrentStepFrames(dataItems, compareItemIndex)
    console.log(" Animating queue:", frameQueue)
    const promise = await animateQueue(frameQueue)
    console.log(" Queue animated")
    setCurrentIterationFinished(true)
    // debugger
    return promise
  }

  const onNextClick = async () => {
    await moveItems(dataItems, compareItemIndex)
  }

  const onPlayClick = () => {
    setInPlayMode(prevPlaying => !prevPlaying)
  }

  const handleSpeedChange = (event) => {
    event.persist();
    setSpeedMode(event.target.value)
  }

  const onRestartClick = () => {
    initialize()
  }

  return (
    <Page
      className={classes.root}
      title="Animation"
    >
      <Container maxWidth="lg">
        <Box mt={1}>
          <Grid container>
            <Grid item xs={12} md={7}>
<Box m={1}>

    <Card >
      <CardHeader title="Animation"/>
      <Divider/>
      <CardContent>

      <svg
        viewBox={`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`}
        ref={ref}
      />

      <Divider/>

      <Box mt={1}>
        <Grid container>
          <Box mb={1} mr={1}><Grid item >
            <Button
              className={classes.action}
              color="secondary"
              variant="contained"
              startIcon={
                <SvgIcon className='SvgIcon'>
                  {inPlayMode ? <PauseIcon /> : <PlayIcon />}
                </SvgIcon>
              }
              disabled={isFullyAnimated}
              onClick={() => onPlayClick()}
              >
              <Typography variant="h3">{playButtonText}</Typography>
            </Button>

            <Button
              className={classes.action}
              color="secondary"
              variant="contained"
              startIcon={
                <SvgIcon className='SvgIcon'>
                  <FastForwardIcon />
                </SvgIcon>
              }
              disabled={inPlayMode || isFullyAnimated}
              onClick={onNextClick}
              >
              <Typography variant="h3">Next</Typography>
            </Button>

            <Button
              className={classes.action}
              color="secondary"
              variant="contained"
              startIcon={
                <SvgIcon className='SvgIcon'>
                  <RefreshCwIcon />
                </SvgIcon>
              }
              onClick={onRestartClick}
              >
              <Typography variant="h3">Restart</Typography>
            </Button>

          </Grid></Box>
          <Box mb={1}><Grid item >
            <Typography variant="h3">
            <TextField
              className={classes.action}
              variant="outlined"
              size="small"
              label="Speed"
              name="speed"
              onChange={handleSpeedChange}
              select
              SelectProps={{ native: true }}
              value={speedMode}
            >
              {speedOptions.map((speedOption) => (
                <option
                  key={speedOption}
                  value={speedOption}
                >
                  {speedOption}
                </option>
              ))}
            </TextField>
            </Typography>
          </Grid></Box>
        </Grid>
      </Box>

      </CardContent>
    </Card>
</Box>

            </Grid>
            <Grid item xs={12} md={5}>
              <Box m={1}>
              <Card >
                    <CardHeader title="Description"/>
                    <Divider/>
                    <CardContent>
                      <Typography align={"justify"}>
                        Using a Min Heap to find the biggest values of an array. One of the goals of a search engine is to collect and present to you
                        the most relevant results based on your search query. Similarly, one of the goals of a recommendation system
                        is to collect and present to you the most relevant results based on your personal interests. Both of these
                        tasks have to tackle the same challenge. They have to select the most important items out of an array
                        of all the available items. We can represent this problem with an array of random numbers, where the
                        number represents the relevancy or importance. In this context the goal is to select the biggest numbers of the array.
                        One way to do this, is to sort the array based on the number, and then select its first items. But sorting a huge
                        array is a waste of resources in this case. You are going to sort a huge number of items that are completely irrelevant.
                        A most efficient way to do it, is to use a Min Heap. A Min Heap is a binary tree data structure where
                        each parent is smaller than its children. With this approach you have to compare every number with
                        the head of the Min Heap and if it is bigger, swap them and rearrange the heap so that it remains a Min Heap.
                        The animation has been done with the amazing <Link target="_blank" variant="body2" color="secondary" href="https://d3js.org/">D3.js</Link> library.
                      </Typography>
                    </CardContent>
                  </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Page>
  )
}

export default MinHeapAnimation
