module.exports = {
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  red: {
    bold: jest.fn((text) => text),
  },
  yellow: jest.fn((text) => text),
  gray: jest.fn((text) => text),
};
