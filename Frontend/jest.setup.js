import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import '@testing-library/jest-dom';
import React from 'react';

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock SpeechRecognition browser API
const mockSpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  onresult: null,
  onerror: null,
  onend: null,
  continuous: false,
  interimResults: false,
  lang: 'en-US'
}));
window.SpeechRecognition = mockSpeechRecognition;
window.webkitSpeechRecognition = mockSpeechRecognition;

// Mock getUserMedia audio streams
navigator.mediaDevices = navigator.mediaDevices || {};
navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue({
  getTracks: () => [{ stop: jest.fn() }]
});

// Mock AudioContext
const mockAudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamSource: jest.fn().mockReturnValue({
    connect: jest.fn()
  }),
  createAnalyser: jest.fn().mockReturnValue({
    fftSize: 64,
    frequencyBinCount: 32,
    getByteFrequencyData: jest.fn()
  }),
  close: jest.fn().mockResolvedValue(undefined)
}));
window.AudioContext = mockAudioContext;
window.webkitAudioContext = mockAudioContext;

// Mock Lucide icons globally
jest.mock('lucide-react', () => {
  const createIcon = (name) => (props) => <svg data-testid={`icon-${name}`} {...props} />;
  return {
    Bell: createIcon('bell'),
    Box: createIcon('box'),
    CheckCircle2: createIcon('checkcircle2'),
    MessageSquare: createIcon('messagesquare'),
    Menu: createIcon('menu'),
    X: createIcon('x'),
    LogOut: createIcon('logout'),
    User: createIcon('user'),
    Moon: createIcon('moon'),
    Sun: createIcon('sun'),
    Upload: createIcon('upload'),
    ImageIcon: createIcon('imageicon'),
    ArrowRight: createIcon('arrowright'),
    Sparkles: createIcon('sparkles'),
    BrainCircuit: createIcon('braincircuit'),
    AlertCircle: createIcon('alertcircle'),
    Clock: createIcon('clock'),
    Mic: createIcon('mic'),
    MicOff: createIcon('micoff'),
    Loader2: createIcon('loader2'),
    Volume2: createIcon('volume2'),
    Globe: createIcon('globe'),
    ChevronDown: createIcon('chevrondown'),
    Settings: createIcon('settings'),
    Cpu: createIcon('cpu'),
    Inbox: createIcon('inbox'),
    Save: createIcon('save'),
    ShieldCheck: createIcon('shieldcheck'),
    ShieldOff: createIcon('shieldoff'),
    KeyRound: createIcon('keyround'),
    MailX: createIcon('mailx'),
    Printer: createIcon('printer'),
    WifiOff: createIcon('wifioff'),
    Download: createIcon('download'),
    Check: createIcon('check'),
    FileText: createIcon('filetext'),
  };
});

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const motionProps = new Set([
    'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView',
    'initial', 'animate', 'exit', 'transition', 'variants', 'layout',
    'layoutId', 'drag', 'dragConstraints', 'dragElastic', 'onDragEnd',
  ]);
  const mockComponent = (name) => {
    const Component = ({ children, ...props }) => {
      const filtered = {};
      for (const [k, v] of Object.entries(props)) {
        if (!motionProps.has(k)) filtered[k] = v;
      }
      return React.createElement(name, filtered, children);
    };
    Component.displayName = `motion.${name}`;
    return Component;
  };
  return {
    motion: {
      div: mockComponent('div'),
      span: mockComponent('span'),
      button: mockComponent('button'),
      header: mockComponent('header'),
      p: mockComponent('p'),
      a: mockComponent('a'),
      ul: mockComponent('ul'),
      li: mockComponent('li'),
      section: mockComponent('section'),
      nav: mockComponent('nav'),
      form: mockComponent('form'),
      img: mockComponent('img'),
    },
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

// Mock React Router Dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: {},
    pathname: '/dashboard'
  }),
  Link: ({ children, to, onClick, className }) => (
    <a href={to} onClick={onClick} className={className}>{children}</a>
  ),
}));

// Mock Tesseract OCR
jest.mock('tesseract.js', () => ({
  recognize: jest.fn().mockResolvedValue({
    data: { text: 'mocked ocr text content' }
  }),
}));

// Export the mocked navigate so we can import it in tests if needed
export { mockedNavigate };
