import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createAlgorithmThunk, createErrorSelector, createStatusSelector} from "../algorithmsSlice";
import {csrfSelector} from "../../csrf/csrfSlice";
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

const AlgorithmForm = () => {
    const dispatch = useDispatch()
    // the create_error is currently necessary to be in the global store, since it takes its value from the
    // thunk's payload creation which lies in the slice file (in another file). the create_status could just be
    // part of the local state.
    const create_status = useSelector(state => createStatusSelector(state))
    const create_error = useSelector(state => createErrorSelector(state))
    const csrf_token = useSelector(state => csrfSelector(state))
    const { enqueueSnackbar, closeSnackbar} = useSnackbar()

    const showBackendError = () => {
      // show back end generated errors in a Snackbar
      if (create_status === 'failed') {
        if (create_error && create_error.name) {
          enqueueSnackbar(
            create_error.name, {variant: 'error'}
          )
        } else {
          enqueueSnackbar(create_error, {variant: 'error'})
        }
      } else if (create_status === 'succeeded') {
        enqueueSnackbar("Algorithm created successfully", {variant: "success"})
      }
    }

    useEffect( () => {
        // show back end generated errors in a Snackbar when the create_status changes which ensures that the effect
        // only runs when the form is submitted. when submitted it becomes pending before becoming succeeded or failed
        showBackendError()
      }, [create_status]
    )

    // you only need to make the onCreatePressed async if you want to await the thunk.
    // you would want to await the thunk in order to catch any asyncThunk internal errors with the unwrapResult function
    const onCreatePressed = async (values) => {
        // in case of no error the thunk returns a resolved promise with a fulfilled action object
        // in case of error, the thunk returns a resolved promise with a rejected action object
        console.log('values', values, 'csrf_token', csrf_token)
        await dispatch(createAlgorithmThunk({'name': values.name, 'csrf_token': csrf_token}))
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

    return(
        <Formik
            initialValues={{name: ''}}
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
            onSubmit = { async (values, {setSubmitting}) => {
                await onCreatePressed(values)
                // isSubmitting must be set to false after the onCreatePressed returns a resolved promise
                setSubmitting(false)
            }}
        >
            { formik => (
              <Card>
              <CardHeader title="Create an Algorithm" />
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
                        placeholder="Name"
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
                          Create
                        </Button>
                      </Grid>
                    </Grid>
                </form>
                  )}
              </CardContent>
              </Card>
            )}
        </Formik>
    )
}


export default AlgorithmForm
