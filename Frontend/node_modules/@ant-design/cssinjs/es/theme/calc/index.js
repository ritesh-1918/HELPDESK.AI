import CSSCalculator from "./CSSCalculator";
import NumCalculator from "./NumCalculator";
const genCalc = (type, unitlessCssVar) => {
  const Calculator = type === 'css' ? CSSCalculator : NumCalculator;
  return num => new Calculator(num, unitlessCssVar);
};
export default genCalc;