"use client";

import InternalDropdown from './dropdown';
import DropdownButton from './dropdown-button';
const Dropdown = InternalDropdown;
/** @deprecated Please use Space.Compact + Dropdown + Button instead */
Dropdown.Button = DropdownButton;
export default Dropdown;