import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
  algorithmsSelector,
  createAlgorithmThunk,
  createErrorSelector,
  createStatusSelector,
  getAlgorithmThunk, getErrorSelector, getStatusSelector, updateErrorSelector, updateStatusSelector
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
import { useSnackbar } from 'notistack'
import {updateAlgorithmThunk} from "./algorithmsSlice";
import BoxedCircularProgress from "../../components/BoxedCircularProgress";

const AlgorithmForm = ({isAddMode, algorithmId}) => {
  const dispatch = useDispatch()
  // the create_error is currently necessary to be in the global store, since it takes its value from the
  // thunk's payload creation which lies in the slice file (in another file). the create_status could just be
  // part of the local state.
  const createStatus = useSelector(state => createStatusSelector(state))
  const createError = useSelector(state => createErrorSelector(state))
  const algorithms = useSelector(state => algorithmsSelector(state))
  const getStatus = useSelector(state => getStatusSelector(state))
  const getError = useSelector(state => getErrorSelector(state))
  const updateStatus = useSelector(state => updateStatusSelector(state))
  const updateError = useSelector(state => updateErrorSelector(state))
  const csrfToken = useSelector(state => csrfSelector(state))
  const {enqueueSnackbar, closeSnackbar} = useSnackbar()
  const [callMode, setCallMode] = useState(null)

  useEffect(() => {
    // if we are in edit mode, fetch item data after component mounts
    if (!isAddMode){
      dispatch(getAlgorithmThunk({'id': algorithmId}))
        .then(response => {
          // console.log("promised response", response)
          // todo maybe store the fetched item in local state instead of global
          setCallMode('get')
        })
      }
    }, []
  )

  // Show back end errors (get, create or update) based on which one was the latest call. If the latest call was
  // a create one, the callMode will be 'create' and the create status and error will be used.
  // Running the effects using only the status values as dependencies doesn't work as expected
  // because the component is mounted every time you visit its route and the effects with dependencies run
  // after mounting, showing the latest generated message which shouldn't be shown.

  useEffect( () => {
    if (callMode === 'get'){
      showBackendError(getStatus, getError, null)
    }
    }, [getStatus, getError, callMode]
  )

  useEffect( () => {
    if (callMode === 'create') {
      const successMessage = "Algorithm created successfully"
      showBackendError(createStatus, createError, successMessage)
    }
    }, [createStatus, createError, callMode]
  )

  useEffect( () => {
    if (callMode === 'update') {
      const successMessage = "Algorithm updated successfully"
      showBackendError(updateStatus, updateError, successMessage)
    }
    }, [updateStatus, updateError, callMode]
  )

  // show back end generated errors in a Snackbar
  const showBackendError = (status, error, successMessage) => {
    console.log("RUNNING BACK END ERROR FUNCTION")
    if (status === 'failed') {
      if (error && error.name) {
        enqueueSnackbar(
          error.name, {variant: 'error'}
        )
      } else {
        enqueueSnackbar(error, {variant: 'error'})
      }
    } else if (status === 'succeeded' && successMessage) {
      enqueueSnackbar(successMessage, {variant: "success"})
    }
  }

  const getFilteredAlgorithm = () => {
    // if the algorithms list is empty (you visit the edit url directly) or the algorithm doesn't exist in the array
    // return the dummy algorithm. Normally the dummy algorithm should never be seen by the user since when the
    // algorithm is fetched is added to the array.
    let dummyAlgorithm = {id: 0, name: "dummy"}
    const algorithm = algorithms.filter(algorithm => algorithm.id === parseInt(algorithmId))[0]
    if (algorithm) {
      return algorithm
    } else {
      return dummyAlgorithm
    }
  }

  const getInitialValues = () => {
    if (isAddMode) return {name: ""}
    return {name: getFilteredAlgorithm().name}
  }

  // you only need to make the onCreatePressed async if you want to await the thunk.
  // you would want to await the thunk in order to catch any asyncThunk internal errors with the unwrapResult function
  const onCreatePressed = async (values) => {
      // in case of no error the thunk returns a resolved promise with a fulfilled action object
      // in case of error, the thunk returns a resolved promise with a rejected action object
      // console.log('values', values, 'csrf_token', csrfToken)
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

  const onSubmit = async (values, {setSubmitting}) => {
    if (isAddMode) {
      await onCreatePressed(values)
      setCallMode('create')
    } else {
      await onUpdatePressed(values)
      setCallMode('update')
    }
    // isSubmitting must be set to false after the onPressed returns a resolved promise
    setSubmitting(false)
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
          <CardContent><Box display="flex" justifyContent="center">Something went wrong</Box></CardContent>
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
          initialValues={getInitialValues()}
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
                      placeholder = {isAddMode ? "Name" : getFilteredAlgorithm().name}
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

    //   )}
    // </>
  )
}


export default AlgorithmForm
