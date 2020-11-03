// show back end generated errors in a Snackbar. The fun argument should be the enqueueSnackbar which is returned
// from a hook so it must be declared inside a component (and passed to this utility function as an argument)
export const showBackendError = (fun, status, error, successMessage) => {
  if (status === 'failed') {
    if (error && error.name) {
      fun(
        error.name, {variant: 'error'}
      )
    } else {
      fun(error, {variant: 'error'})
    }
  } else if (status === 'succeeded' && successMessage) {
    fun(successMessage, {variant: "success"})
  }
}
