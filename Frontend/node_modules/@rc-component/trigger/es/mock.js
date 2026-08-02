import * as React from 'react';
import { generateTrigger, UniqueProvider } from "./index";
const MockPortal = ({
  open,
  autoDestroy,
  children,
  getContainer
}) => {
  const [visible, setVisible] = React.useState(open);
  React.useEffect(() => {
    getContainer?.();
  });
  React.useEffect(() => {
    if (open) {
      setVisible(true);
    } else if (autoDestroy) {
      setVisible(false);
    }
  }, [open, autoDestroy]);
  return visible ? children : null;
};
export default generateTrigger(MockPortal);
export { UniqueProvider };