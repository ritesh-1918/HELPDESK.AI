import { lintWarning } from "./utils";
const linter = (key, value, info) => {
  if (typeof value === 'string' && /NaN/g.test(value) || Number.isNaN(value)) {
    lintWarning(`Unexpected 'NaN' in property '${key}: ${value}'.`, info);
  }
};
export default linter;