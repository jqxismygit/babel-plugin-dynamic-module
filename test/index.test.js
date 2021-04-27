import * as babel from '@babel/core';
import myPlugin from '../src/index';

describe('plugin test', () => {
  it('test case 1', () => {
    const code = `import { usePassport, useSocket, request } from '@sensoro/core';`;
    const result = babel.transform(code, {
      plugins: [myPlugin],
    });
    expect(result.code).toBe(`const {
  usePassport,
  useSocket,
  request
} = window._sensorocore_;`);
  });

  it('test case 2', () => {
    const code = `import * as Core from '@sensoro/core';`;
    const result = babel.transform(code, {
      plugins: [myPlugin],
    });
    expect(result.code).toBe('const Core = window._sensorocore_;');
  });

  it('test case 3', () => {
    const code = `import Core from '@sensoro/core';`;
    const result = babel.transform(code, {
      plugins: [myPlugin],
    });
    expect(result.code).toBe('const Core = window._sensorocore_;');
  });

  it('test case 4', () => {
    const code = `import {  default as A, B } from '@sensoro/core';`;
    const result = babel.transform(code, {
      plugins: [myPlugin],
    });
    expect(result.code).toBe(`const A = window._sensorocore_;
const {
  B
} = A;`);
  });

  it('test case 5', () => {
    const code = `import C, { D } from '@sensoro/core';`;
    const result = babel.transform(code, {
      plugins: [myPlugin],
    });
    expect(result.code).toBe(`const C = window._sensorocore_;
const {
  D
} = C;`);
  });

  it('test case 6', () => {
    const code = `import {A as B} from '@sensoro/core';`;
    const result = babel.transform(code, {
      plugins: [myPlugin],
    });
    expect(result.code).toBe(`const {
  A: B
} = window._sensorocore_;`);
  });
  // [myPlugin, { modules: ['123'] }]

  it('test case 7', () => {
    const code = `import { get } from 'lodash';`;
    const result = babel.transform(code, {
      plugins: [myPlugin],
    });
    expect(result.code).toBe(`import { get } from 'lodash';`);
  });

  it('test case 8', () => {
    const code = `import { get } from 'lodash';`;
    const result = babel.transform(code, {
      plugins: [[myPlugin, { modules: ['lodash'] }]],
    });
    expect(result.code).toBe(`const {
  get
} = window._lodash_;`);
  });
});
