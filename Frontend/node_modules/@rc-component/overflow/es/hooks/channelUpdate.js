import raf from "@rc-component/util/es/raf";
export default function channelUpdate(callback) {
  if (typeof MessageChannel === 'undefined') {
    raf(callback);
  } else {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => callback();
    channel.port2.postMessage(undefined);
  }
}