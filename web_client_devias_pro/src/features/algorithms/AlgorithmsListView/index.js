import React, {
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  Box,
  Container,
  makeStyles
} from '@material-ui/core';
import axios from 'src/utils/axios';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Results';
import {useSelector, useDispatch} from "react-redux";
import {getAlgorithmsThunk, getStatusSelector, getErrorSelector, algorithmsSelector } from "../algorithmsSlice";
import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

const AlgorithmsListView = () => {
  const classes = useStyles();
  const dispatch = useDispatch()
  // const isMountedRef = useIsMountedRef();
  // const [orders, setOrders] = useState([]);
  const get_status = useSelector(state => getStatusSelector(state))
  const get_error = useSelector(state => getErrorSelector(state))
  const algorithms = useSelector(state => algorithmsSelector(state))
  const { enqueueSnackbar, closeSnackbar} = useSnackbar()
  const [numCalls, setNumCalls] = useState(0)

  // update the numCalls only when the get thunk completes its execution
  const get = async () => {
    await dispatch(getAlgorithmsThunk())
    setNumCalls(numCalls + 1)
  }

  useEffect(() => {
    // getting the items on 'idle' means getting them only the first time the component renders
    // This means that you need to reload the page to make a new get call.
    if (get_status === 'idle') {
      const promise = get()
    }
  })

  useEffect(() => {
    if (numCalls > 0) {
      if (get_status === 'failed' && get_error) {
        enqueueSnackbar(get_error, {variant: 'error'})
      }
    }
  }, [numCalls])

  // const getOrders = useCallback(async () => {
  //   try {
  //     const response = await axios.get('/api/orders');
  //
  //     if (isMountedRef.current) {
  //       setOrders(response.data.orders);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [isMountedRef]);

  // useEffect(() => {
  //   getOrders();
  // }, [getOrders]);

  return (
    <Page
      className={classes.root}
      title="Algorithms List"
    >
      <Container maxWidth={false}>
        <Header />
        <Box mt={3}>
          <Results items={algorithms} />
        </Box>
      </Container>
    </Page>
  );
};

export default AlgorithmsListView
