"use client";

import { createContext } from 'react';
// ZombieJ: We export single file here since
// ConfigProvider use this which will make loop deps
// to import whole `rc-component/form`
export default /*#__PURE__*/createContext(undefined);