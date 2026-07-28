import Cell from "./Cell";
import Row from "./Row";
/**
 * Syntactic sugar. Do not support HOC.
 */
const Summary = props => {
  const {
    children
  } = props;
  return children;
};
Summary.Row = Row;
Summary.Cell = Cell;
export default Summary;