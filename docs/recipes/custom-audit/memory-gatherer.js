/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {Gatherer} from 'lighthouse';

class MemoryProfile extends Gatherer {
  meta = {
    supportedModes: ['navigation', 'timespan'],
  };

  async startInstrumentation(context) {
    const session = context.driver.defaultSession;
    await session.sendCommand('Memory.startSampling');
  }

  async stopInstrumentation(context) {
    const session = context.driver.defaultSession;
    await session.sendCommand('Memory.stopSampling');
  }

  async getArtifact(context) {
    const session = context.driver.defaultSession;
    const {profile} = await session.sendCommand('Memory.getSamplingProfile');

    return profile;
  }
}

export default MemoryProfile;
