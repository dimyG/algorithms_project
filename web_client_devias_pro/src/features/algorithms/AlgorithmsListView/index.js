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
import {getAlgorithms} from "../algorithmsSlice";

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
  const get_status = useSelector(state => state.algorithms.get_status)
  const get_error = useSelector(state => state.algorithms.get_error)
  const algorithms = useSelector(state => state.algorithms.list)

  useEffect(() => {
      if (get_status === 'idle'){
          dispatch(getAlgorithms())
      }
  })

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
          <Results orders={algorithms} />
        </Box>
      </Container>
    </Page>
  );
};

export default AlgorithmsListView;
