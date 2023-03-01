/**
 * @license Copyright 2018 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import assert from 'assert/strict';

import Audit from '../../../audits/dobetterweb/doctype.js';
import {createTestTrace} from '../../create-test-trace.js';

/**
 * @param {LH.Artifacts} artifacts
 */
function runAudit(artifacts) {
  const context = {computedCache: new Map()};
  return Audit.audit(artifacts, context);
}

describe('DOBETTERWEB: doctype audit', () => {
  it('fails when document does not contain a doctype', async () => {
    const auditResult = await runAudit({
      Doctype: null,
    });
    assert.equal(auditResult.score, 0);
    expect(auditResult.explanation).toBeDisplayString('Document must contain a doctype');
  });

  it('fails when document is in quirks-mode (but passes other checks)', async () => {
    const auditResult = await runAudit({
      // eg `<!DOCTYPE html foo>`. https://github.com/GoogleChrome/lighthouse/issues/10030
      Doctype: {
        name: 'html',
        publicId: '',
        systemId: '',
        documentCompatMode: 'BackCompat',
      },
    });
    assert.equal(auditResult.score, 0);
    expect(auditResult.explanation)
        .toBeDisplayString('Document contains a `doctype` that triggers `quirks-mode`');
  });

  it('fails when document is in limited-quirks-mode', async () => {
    const auditResult = await runAudit({
      // eg `<!DOCTYPE html foo>`. https://github.com/GoogleChrome/lighthouse/issues/10030
      Doctype: {
        name: 'html',
        publicId: '-//W3C//DTD HTML 4.01 Transitional//EN',
        systemId: 'http://www.w3.org/TR/html4/loose.dtd',
        documentCompatMode: 'CSS1Compat',
      },
      InspectorIssues: {
        quirksModeIssue: [{isLimitedQuirksMode: true, frameId: 'ROOT_FRAME'}],
      },
      traces: {[Audit.DEFAULT_PASS]: createTestTrace({})},
    });
    assert.equal(auditResult.score, 0);
    expect(auditResult.explanation)
        .toBeDisplayString('Document contains a `doctype` that triggers `limited-quirks-mode`');
  });

  it('passes when non-main frame document is in limited-quirks-mode', async () => {
    const auditResult = await runAudit({
      // eg `<!DOCTYPE html foo>`. https://github.com/GoogleChrome/lighthouse/issues/10030
      Doctype: {
        name: 'html',
        publicId: '-//W3C//DTD HTML 4.01 Transitional//EN',
        systemId: 'http://www.w3.org/TR/html4/loose.dtd',
        documentCompatMode: 'CSS1Compat',
      },
      InspectorIssues: {
        quirksModeIssue: [{isLimitedQuirksMode: true, frameId: 'iframe'}],
      },
      traces: {[Audit.DEFAULT_PASS]: createTestTrace({})},
    });
    assert.equal(auditResult.score, 1);
  });

  it('fails when the value of the name attribute is a value other than "html"', async () => {
    const auditResult = await runAudit({
      Doctype: {
        name: 'xml',
        publicId: '',
        systemId: '',
        documentCompatMode: 'BackCompat',
      },
    });
    assert.equal(auditResult.score, 0);
    expect(auditResult.explanation).toBeDisplayString(
      'Doctype name must be the string `html`');
  });

  it('fails when the publicId attribute is not an empty string', async () => {
    const auditResult = await runAudit({
      Doctype: {
        name: 'html',
        publicId: '189655',
        systemId: '',
        documentCompatMode: 'BackCompat',
      },
    });
    assert.equal(auditResult.score, 0);
    expect(auditResult.explanation).toBeDisplayString('Expected publicId to be an empty string');
  });

  it('fails when the systemId attribute is not an empty string', async () => {
    const auditResult = await runAudit({
      Doctype: {
        name: 'html',
        publicId: '',
        systemId: '189655',
        documentCompatMode: 'BackCompat',
      },
    });
    assert.equal(auditResult.score, 0);
    expect(auditResult.explanation).toBeDisplayString('Expected systemId to be an empty string');
  });

  it('succeeds when document is regular html doctype', async () => {
    const auditResult = await runAudit({
      Doctype: {
        name: 'html',
        publicId: '',
        systemId: '',
        documentCompatMode: 'CSS1Compat',
      },
    });
    assert.equal(auditResult.score, 1);
  });

  // eslint-disable-next-line max-len
  it('succeeds when document is CSS1Compat, did not detect limit-quirks-mode, and regardless of doctype values seen', async () => {
    const auditResult = await runAudit({
      Doctype: {
        name: 'html',
        publicId: '-//W3C//DTD HTML 4.01 Transitional//EN',
        systemId: 'http://www.w3.org/TR/html4/loose.dtd',
        documentCompatMode: 'CSS1Compat',
      },
    });
    assert.equal(auditResult.score, 1);
  });
});
