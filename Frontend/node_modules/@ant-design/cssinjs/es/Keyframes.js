class Keyframe {
  name;
  style;
  constructor(name, style) {
    this.name = name;
    this.style = style;
  }
  getName(hashId = '') {
    return hashId ? `${hashId}-${this.name}` : this.name;
  }
  _keyframe = true;
}
export default Keyframe;