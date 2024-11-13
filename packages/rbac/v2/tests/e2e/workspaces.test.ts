import { describe, expect, test } from '@jest/globals';
import {
  config,
  createWorkspace,
  deleteWorkspace,
  listWorkspaces,
  // patchWorkspace,
  readWorkspace,
  WORKSPACES_API_BASE,
  // updateWorkspace,
} from './client';

import { AxiosRequestConfig } from 'axios';
import { WorkspacesWorkspaceTypesQueryParam } from '../../api';
import { convertConfig, updateConfig } from './util';

describe('Workspaces API endpoints', () => {
  const TEST_WORKSPACE_NAME = 'JSClientsTestWorkspace';
  const TEST_WORKSPACE_DESC = 'Test workspace created by JS Clients test automation';

  test('full sequence', async () => {
    const axiosConfig = await updateConfig(config, WORKSPACES_API_BASE);
    const convertedConfig: AxiosRequestConfig = await convertConfig(axiosConfig);

    // create it
    const createResponse = await createWorkspace(TEST_WORKSPACE_NAME, TEST_WORKSPACE_DESC, convertedConfig);
    expect(createResponse.status).toEqual(201);
    const workspaceId = createResponse.data.id;
    expect(workspaceId).toBeTruthy();

    // list it, confirm it's in the list
    const findResult2 = await listWorkspaces(100, 0, WorkspacesWorkspaceTypesQueryParam.All, convertedConfig);
    expect(findResult2).toBeTruthy();

    // update it
    // const updateResult = await updateWorkspace(workspaceId, {name: TEST_WORKSPACE_UPDATED_NAME, description: TEST_WORKSPACE_UPDATED_DESC, parent_id: ""}, convertedConfig)

    // read it
    const readResult = await readWorkspace(workspaceId, false, convertedConfig);
    // response matches example response
    expect(readResult.status).toEqual(200);
    expect(readResult.data.name).toEqual('Workspace A');
    expect(readResult.data.description).toEqual('Description of Workspace A');

    // patch it
    // const patchResult = await patchWorkspace(workspaceId, {name: TEST_WORKSPACE_PATCHED_NAME, description: TEST_WORKSPACE_PATCHED_DESC}, convertedConfig);
    // expect(patchResult.data.name).toEqual(TEST_WORKSPACE_PATCHED_NAME);
    // expect(patchResult.data.description).toEqual(TEST_WORKSPACE_PATCHED_DESC);

    // read it again
    // const readResult2 = await readWorkspace(workspaceId, false, convertedConfig);
    // expect(readResult2.data.name).toEqual(TEST_WORKSPACE_PATCHED_NAME);
    // expect(readResult2.data.name).toEqual(TEST_WORKSPACE_PATCHED_DESC);

    // list it again
    // const findResult3 = await findWorkspaceByName(TEST_WORKSPACE_PATCHED_NAME, convertedConfig);
    // expect(findResult3).toBeTruthy();

    // delete it
    const deleteResult = await deleteWorkspace(workspaceId, convertedConfig);
    expect(deleteResult.status).toEqual(204);
  });
});
