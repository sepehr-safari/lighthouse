/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {Audit} from 'lighthouse';

const MAX_MEMORY_USAGE = 1_000_000;

/**
 * @fileoverview Tests that the memory usage is below a certain threshold.
 */

class MemoryUsage extends Audit {
  static get meta() {
    return {
      id: 'memory-audit',
      title: 'Did not find any large memory usage',
      failureTitle: 'Found large memory usage',
      description: 'Detects if any memory sample was larger than 1 MB',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: ['MemoryProfile'],
    };
  }

  static audit(artifacts) {
    let largestMemoryUsage = 0;
    for (const sample of artifacts.MemoryProfile.samples) {
      if (sample.total > largestMemoryUsage) {
        largestMemoryUsage = sample.total;
      }
    }

    return {
      numericValue: largestMemoryUsage,
      score: largestMemoryUsage > MAX_MEMORY_USAGE ? 0 : 1,
    };
  }
}

export default MemoryUsage;
