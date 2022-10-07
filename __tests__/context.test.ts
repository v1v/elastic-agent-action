import {expect, test} from '@jest/globals';
import {getInputs} from '../src/context';

test('with fleetUrl and enrollmentToken getInputs does not throw error', async () => {
  process.env['INPUT_FLEET_URL'] = 'dbowie';
  process.env['INPUT_ENROLLMENT_TOKEN'] = 'groundcontrol';
  process.env['INPUT_LOGOUT'] = 'true';
  expect(() => {
    getInputs();
  }).not.toThrowError();
});
