import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
  algorithmsSelector,
  createAlgorithmThunk,
  createErrorSelector,
  createStatusSelector,
  getAlgorithmThunk, getStatusSelector
} from "./algorithmsSlice";
import {csrfSelector} from "../csrf/csrfSlice";
import {Formik, Form, Field, ErrorMessage, useFormik} from "formik";
import Page from 'src/components/Page'
import {Contactless} from "@material-ui/icons";
import {
  Container,
  Box,
  Card,
  CardHeader,
  Divider,
  CardContent,
  CircularProgress,
  TextField,
  Button,
  Grid
} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import { useSnackbar } from 'notistack'
import {updateAlgorithmThunk} from "./algorithmsSlice";
import GetAlgorithms from "./GetAlgorithms";
import BoxedCircularProgress from "../../components/BoxedCircularProgress";

const AlgorithmForm = ({isAddMode, algorithmId}) => {
  const dispatch = useDispatch()
  // the create_error is currently necessary to be in the global store, since it takes its value from the
  // thunk's payload creation which lies in the slice file (in another file). the create_status could just be
  // part of the local state.
  const create_status = useSelector(state => createStatusSelector(state))
  const create_error = useSelector(state => createErrorSelector(state))
  const algorithms = useSelector(state => algorithmsSelector(state))
  const getStatus = useSelector(state => getStatusSelector(state))
  // const create_status = useSelector(state => state.algorithms.create_status)
  // const create_error = useSelector(state => state.algorithms.create_error)
  const csrfToken = useSelector(state => csrfSelector(state))
  const {enqueueSnackbar, closeSnackbar} = useSnackbar()
  const [numCalls, setNumCalls] = useState(0)
  const [filteredAlgorithm, setFilteredAlgorithm] = useState({id: 0, name: "dummy"})
  // const [initialValues, setInitialValues] = useState({name: filteredAlgorithm.name})

  // show back end generated errors in a Snackbar
  const showBackendError = (status, error) => {
    if (status === 'failed') {
      if (error && error.name) {
        enqueueSnackbar(
          error.name, {variant: 'error'}
        )
      } else {
        enqueueSnackbar(error, {variant: 'error'})
      }
    } else if (status === 'succeeded') {
      enqueueSnackbar("Algorithm created successfully", {variant: "success"})
    }
  }

  useEffect( () => {
      // show back end generated errors only after a call (when the number of calls changes). Do not show it
      // if it is 0 (0 means that the component has just rendered)
      // todo running the effect when the create_status changes instead of the numCalls doesn't work as expected. Why?
      if (numCalls > 0) showBackendError(create_status, create_error)
    }, [numCalls]
  )

  let initialValues = {name: filteredAlgorithm.name}
  if (isAddMode){
    initialValues = {name: ''}
  }else{
    // Only get the filtered item (algorithm) if there are fetched items (algorithms) in the store.
    // if you visit the edit url directly then the algorithms list would be empty and filteredAlgorithm undefined
    // if (algorithms.length) setFilteredAlgorithm(algorithms.filter(algorithm => algorithm.id === parseInt(algorithmId))[0])
    if (algorithms.length) {
      const algorithm = algorithms.filter(algorithm => algorithm.id === parseInt(algorithmId))[0]
      initialValues = {name: algorithm.name}
      // setFilteredAlgorithm(algorithms.filter(algorithm => algorithm.id === parseInt(algorithmId))[0])
      // initialValues = {name: filteredAlgorithm.name}
    }
  }
  console.log("GLOBAL CODE RUNS")

  useEffect(() => {
    if (isAddMode) return
    // if we are in edit mode, fetch item data if it hasn't been fetched already (if status is "idle")
    if (getStatus === 'idle'){
      dispatch(getAlgorithmThunk({'id': algorithmId}))
        .then(response => {
          console.log("promised response", response)
        })
      // todo maybe store the fetched item in local state instead of global to make things work in a simple way?
      // todo show errors
      // todo show values
    }
    else if (getStatus === 'succeeded'){
      if (algorithms.length) setFilteredAlgorithm(algorithms.filter(algorithm => algorithm.id === parseInt(algorithmId))[0])
      initialValues = {name: filteredAlgorithm.name}
    //   // debugger
    //   // let filteredAlgorithm = {id: 0, name: "dummy"}
    //   // let initialValues = {name: filteredAlgorithm.name}
    //   // const filteredAlgorithms = algorithms.filter(algorithm => algorithm.id === parseInt(algorithmId))
    //   // filteredAlgorithms.length > 1 ? console.error('Algorithms with the same id found in the stored algorithms list') : console.log()
    //   // const filteredAlgorithm = filteredAlgorithms[0]
    //   // setFilteredAlgorithm(filteredAlgorithms[0])
    //   // if (filteredAlgorithms.length) {
    //   //   console.log("filteredAlgorithms: ", filteredAlgorithms, "filteredAlgorithm", filteredAlgorithm)
    //   //   isAddMode ? initialValues = {name: ''} : initialValues = {name: filteredAlgorithm.name}
    //   //   // isAddMode ? setInitialValues({name: ''}) : setInitialValues({name: filteredAlgorithm.name})
    //   // }
    }
    debugger
  }, [getStatus])

  const onSubmit = async (values, {setSubmitting}) => {
    if (isAddMode) {
      await onCreatePressed(values)
    } else {
      await onUpdatePressed(values)
    }
    // isSubmitting must be set to false after the onPressed returns a resolved promise
    setSubmitting(false)
    setNumCalls(numCalls + 1)
  }

  // you only need to make the onCreatePressed async if you want to await the thunk.
  // you would want to await the thunk in order to catch any asyncThunk internal errors with the unwrapResult function
  const onCreatePressed = async (values) => {
      // in case of no error the thunk returns a resolved promise with a fulfilled action object
      // in case of error, the thunk returns a resolved promise with a rejected action object
      console.log('values', values, 'csrf_token', csrfToken)
      await dispatch(createAlgorithmThunk({'name': values.name, 'csrfToken': csrfToken}))
      // we don't use the try catch here. We use it inside the createAlgorithmThunk's payload creator so that we get the
      // server generated message
      // try{
      //     const create_result = await dispatch(createAlgorithmThunk({'name': name, 'csrf_token': csrf_token}))
      //     unwrapResult(create_result)
      //     setName('')
      // }catch (error){
      //     // This error is the action.error that can be inspected in the redux dev tools window
      //     console.log('algorithm created caught error', error)
      // }
  }

  const onUpdatePressed = async (values) => {
    await dispatch(updateAlgorithmThunk({'id': algorithmId, 'name': values.name, 'csrfToken': csrfToken}))
  }

  if (!isAddMode) {
    if (getStatus === "loading") {
      return (
        <BoxedCircularProgress/>
      )
    } else if (getStatus === "failed") {
      return (
        <Card>
          <CardHeader title={isAddMode ? "Create Algorithm" : "Update Algorithm"}/>
          <Divider/>
          <CardContent>Something went wrong</CardContent>
        </Card>
      )
    }
  }

  return(
    // <>
    //   {getStatus === "loading" ? (
    //     <BoxedCircularProgress/>
    //   ) : (

      <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validate={values => {
              let errors = {};
              if (!values.name){
                  errors.name = 'Name should not be empty'
              }else if (values.name.length < 2){
                  errors.name = 'Too short name'
              }else if (values.name.length > 100){
                  errors.name = 'Too long name'
              }
              return errors
          }}
          onSubmit={onSubmit}
      >
          { formik => (
            <Card>
            <CardHeader title = {isAddMode ? "Create Algorithm" : "Update Algorithm"} />
            <Divider />
            <CardContent>
              {formik.isSubmitting ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  my={5}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                      error={Boolean(formik.touched.name && formik.errors.name)}
                      fullWidth
                      helperText={formik.touched.name && formik.errors.name}
                      label="Algorithm's Name"
                      name='name'
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type='text'
                      placeholder = {isAddMode ? "Name" : filteredAlgorithm.name}
                      value={formik.values.name}
                      variant="outlined"
                    />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        color="secondary"
                        disabled={formik.isSubmitting}
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                      >
                        {isAddMode ? "Create" : "Update"}
                      </Button>
                    </Grid>
                  </Grid>
              </form>
                )}
            </CardContent>
            </Card>
          )}
      </Formik>

      // )}
    // </>
  )
}


export default AlgorithmForm
