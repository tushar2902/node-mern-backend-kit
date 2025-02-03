const useragent = require('express-useragent');

exports.getUserAgent = (req) => {
  const source = req.headers['user-agent'];
  const ua = useragent.parse(source);
  console.log(ua); // todo remove after testing
  if (ua.isMobile && ua.isAndroid) {
    return 'android';
  }
  if (ua.isMobile && (ua.isiPad, ua.isiPhone)) {
    return 'ios';
  }
  return 'web';
};
