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
  TextField
} from "@material-ui/core";
import clsx from "clsx";
import {Link as RouterLink} from "react-router-dom";
import {Play as PlayIcon, Pause as PauseIcon, FastForward as FastForwardIcon, RefreshCw as RefreshCwIcon, PlusCircle as PlusCircleIcon} from "react-feather";
import Page from "../../components/Page";
import { useTheme } from "@material-ui/core/styles";

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

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

class DataItem {
  constructor(id, x, y, parent, value=0, heapIndex=null) {
    this.id = id
    this.x = x
    this.y = y
    this.value = value
    this.heapIndex = heapIndex
  }
}

class Heap {
  constructor(items) {
    this.items = items
  }

  push = (item) => {
  }

  pop = (item) => {
  }

  swap = (item1, item2) => {
    const index1 = this.items.indexOf(item1)
    const index2 = this.items.indexOf(item2)
    // console.log("swapping heap values:", item1.value, `${index1}`, item2.value, `${index2}`, " ...")
    this.items[index1] = item2
    this.items[index2] = item1
    console.log("heap after swap:", this.items)
  }

}

class DataItems {
  constructor(items = [], frameQueue = new Queue(), heap = null) {
    this.items = items
    this.frameQueue = frameQueue
    // this.heap = heap? heap : new Heap(this.heapItems())
  }

  enqueueFrame = (frameData = this.items) => {
    // A frame is the array of items (items have new coordinates in each frame).
    console.log("  enqueueing frame:", frameData)
    this.frameQueue.enqueue(frameData)
  }

  swap = (item1, item2) => {
    // Swap their coordinates
    // d3 identifies elements by their index. We identify elements by their value.
    // This means that the index-value pair must remain the same.
    // Think of it like this: An item is moving when its x and y coordinates change, not when its index change
    const index1 = this.items.indexOf(item1)
    const index2 = this.items.indexOf(item2)
    if (index1 === -1 || index2 === -2) {
      console.log("  items to be swapped not found in items array:", this.items)
      console.log("    item1", item1)
      console.log("    item2", item2)
      return
    }
    console.log("  swapping values:", item1.value, `${index1}`, item2.value, `${index2}`, " ...")
    this.items = this.items.map((item, index) => {
      if (index === index1) return {...item2, value: item.value, id: item.id}
      else if (index === index2) return {...item1, value: item.value, id: item.id}
      else return {...item}
    })
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

  heapItems = () => {
    // get the items that belong to the heap
    return this.items.filter(item => item.heapIndex)
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
    console.log("  item:", heapItem, "has no kids")
  }

  itemKidsSorted = (heapItem, sortedHeapItems=this.heapItemsSortedByIndex()) => {
    const kids = this.itemKids(heapItem, sortedHeapItems)
    console.log("  kids:", kids)
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

  firstItemsX = () => this.items[0].x

  reheap = (heapIndex= 0) => {
    // todo use the item.heapIndex property to avoid sorting
    console.log("reheaping from index:", heapIndex)
    const sortedHeapItems = this.heapItemsSortedByIndex()
    const item = sortedHeapItems[heapIndex]
    // const item = this.items.filter((item) => item.heapIndex = heapIndex+1)[0]
    console.log("  reheaping item:", item)
    const smallerKid = this.getKidForSwap(item, sortedHeapItems)
    if (!smallerKid) {
      console.log("  smallerKid:", smallerKid)
      return
    }  // item has no kids
    this.swap(item, smallerKid)
    // reheap again starting from the swapped kid
    this.reheap(smallerKid.heapIndex-1)  // have in mind that currently heapIndex property starts from 1 not 0
    console.log("reheap of item", item, "with index", heapIndex, "completed")
  }

}

const numbersLength = 10
const generateRandomArray = (length, maxValue) => [...new Array(length)].map(() => Math.round(Math.random() * maxValue));
const randomNumbers = generateRandomArray(numbersLength, 100)

const svgViewBoxWidth = 100
const svgViewBoxHeight = 35
const heapHeadX = svgViewBoxWidth * 0.5
const heapHeadY = svgViewBoxHeight * 0.5
const circleRadius = 3
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

const createInitialHeapItems = () => {
  let items = []
  let x, y
  for (let i=0; i<heapSize; i++){
    let layer
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

// const initialHeapItems = createInitialHeapItems()

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
    minWidth: 100
  }
}));

const Circles = () => {
  const classes = useStyles()
  const [frame, setFrame] = useState(initialItems)
  const [heapData, setHeapData] = useState(initialHeapItems)
  // Maybe use dataItems.items as state and rerender the component whenever dataItems.items change?
  // Notice that if an object of the dataItems.items array changes, the items array itself doesn't
  const [dataItems, setDataItems] = useState(new DataItems(initialItems))
  const [speedMode, setSpeedMode] = useState("Fast")
  const [inPlayMode, setInPlayMode] = useState(false)
  const [previousIterationFinished, setPreviousIterationFinished] = useState(true)
  const [numIterations, setNumIterations] = useState(0)
  const theme = useTheme()
  const ref = useRef()

  const initialize = () => {
    setFrame(initialItems)
    setHeapData(initialHeapItems)
    setDataItems(new DataItems(initialItems))
    setInPlayMode(false)
    setPreviousIterationFinished(true)
    setNumIterations(0)
  }

  const speedOptions = ["Slow", "Medium", "Fast", "Ultra Fast"]
  const playModeOptions = ["Playing", "Paused"]
  const playButtonText = inPlayMode ? "Pause" : "Play"

  let frameTransitionDuration = 750

  if (speedMode === "Slow"){
    frameTransitionDuration = 1250
  } else if (speedMode === "Medium"){
    frameTransitionDuration = 750
  } else if (speedMode === "Fast"){
    frameTransitionDuration = 350
  } else {
    frameTransitionDuration = 100
  }

  const generateIterationFrames = () => {
    // const dataItems = new DataItems(prevItems)
    const heapHead = dataItems.heapHead()
    for (const item of dataItems.items) {
      if (!item.heapIndex && Math.abs(item.x - heapHead.x) < 1) {
        if (item.value > heapHead.value){
          console.log("pushing item to heap")
          dataItems.swap(item, heapHead)
          dataItems.reheap()
          return dataItems.frameQueue
        }
      }
    }
    dataItems.moveRight()
    return dataItems.frameQueue
  }

  const delay = ms => {
    console.log("  delaying for:", ms)
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

  const iterate = async () => {
    console.log(">>> Iterating <<<")
    setPreviousIterationFinished(false)
    setNumIterations(prevCount => prevCount + 1)
    generateIterationFrames()
    console.log("> Animating queue:", dataItems.frameQueue)
    const promise = await animateQueue(dataItems.frameQueue)
    console.log("> Queue animated")
    setPreviousIterationFinished(true)
    // debugger
    return promise
  }

  const onNextClick = async () => {
    await iterate()
  }

  const onPlayClick = () => {
    setInPlayMode(prevPlaying => !prevPlaying)
  }

  const handleSpeedChange = (event) => {
    // event.persist();
    setSpeedMode(event.target.value)
  }

  const onRestartClick = () => {
    initialize()
  }

  useEffect(() => {
    // todo currently it's not d3 that rerenders when the data change. The effect is running in every data change and
    // runs d3 from the beginning with the new data!

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
      .attr("stroke-width", 0.05)

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
    if (numIterations <= maxIterations && inPlayMode && previousIterationFinished) iterate()

  }, [
    frame, heapData, numIterations, inPlayMode, previousIterationFinished,
    theme.name,  // theme.name so that every time the theme changes the effect runs and new circlesTheme is used
  ])

  // useInterval(() => {
  //   // const newDataset = nextDataset(dataset)
  //   setDataset(prevDataset => nextDataset(prevDataset))
  // }, 500)

  return (
    <Page
      className={classes.root}
      title="Animation"
    >
      <Container maxWidth="lg">
        <Box mt={1}>
          <Grid container>
            <Grid
              item
              xs={12}
            >


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
                <SvgIcon fontSize="small">
                  {inPlayMode ? <PauseIcon /> : <PlayIcon />}
                </SvgIcon>
              }
              disabled={numIterations >= maxIterations}
              onClick={() => onPlayClick()}
              >
              {playButtonText}
            </Button>

            <Button
              className={classes.action}
              color="secondary"
              variant="contained"
              startIcon={
                <SvgIcon fontSize="small">
                  <FastForwardIcon />
                </SvgIcon>
              }
              disabled={inPlayMode}
              onClick={onNextClick}
              >
                Next
            </Button>

            <Button
              className={classes.action}
              color="secondary"
              variant="contained"
              startIcon={
                <SvgIcon fontSize="small">
                  <RefreshCwIcon />
                </SvgIcon>
              }
              onClick={onRestartClick}
              >
              Restart
            </Button>

          </Grid></Box>
          <Box mb={1}><Grid item >
            <TextField
              className={classes.action}
              variant="outlined"
              size={"small"}
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
          </Grid></Box>
        </Grid>

      {/*<Button*/}
      {/*  color="secondary"*/}
      {/*  variant="contained"*/}
      {/*  // className={classes.action}*/}
      {/*  onClick={onNextClick}*/}
      {/*  >*/}
      {/*    HeapSize*/}
      {/*</Button>*/}

      </Box>

      </CardContent>
    </Card>

            </Grid>
          </Grid>
        </Box>
      </Container>
    </Page>
  )
}

export default Circles
