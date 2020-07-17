// _error.js

module.exports = async function HandleError(context, props) {
  // console.error(props.error);
  // or you can choose not to reply any error messages

  console.log('caught error\n')
  console.log('props', props)
  console.log('error', props.error)
  console.log('stack', props.error.stack)

  await context.sendText(
    "Oops! Something went wrong 💣 ! Please try again in a bit"
  );
  if (process.env.NODE_ENV === 'production') {
    // TODO send your error to your error tracker, for example: Sentry
    // maybe remove this when we're public
    await context.sendText(props.error);
  }
  if (process.env.NODE_ENV === 'development') {
    await context.sendText(props.error);
  }
};
