import { describe, expect, test } from '@jest/globals';
import {
  config,
  createWorkspace,
  deleteWorkspace,
  listWorkspaces,
  // patchWorkspace,
  readWorkspace,
  // updateWorkspace,
  WORKSPACES_API_BASE,
} from './client';
import { updateConfig, convertConfig } from './util';
import { AxiosRequestConfig } from 'axios';
import { WorkspacesWorkspace, WorkspacesWorkspaceTypesQueryParam } from '../../api';

const findWorkspaceByName = async (
  workspaceName: string,
  query: WorkspacesWorkspaceTypesQueryParam,
  axiosConfig: AxiosRequestConfig,
): Promise<WorkspacesWorkspace | null> => {
  const workspaceList = await listWorkspaces(1000, 0, query, axiosConfig);
  for (const workspace of workspaceList.data.data) {
    if (workspace.name === workspaceName) {
      return workspace;
    }
  }
  return null;
};

const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

describe('Workspaces API CRUD operations', () => {
  const TEST_WORKSPACE_NAME = 'JSClientsTestWorkspace';
  const TEST_WORKSPACE_DESC = 'Test workspace created by JS Clients test automation';

  // const TEST_WORKSPACE_UPDATED_NAME = 'JSClientsTestWorkspaceUpdatedName';
  // const TEST_WORKSPACE_UPDATED_DESC = 'Test workspace created by JS Clients test automation (Updated)';

  // const TEST_WORKSPACE_PATCHED_NAME = 'JSClientsTestWorkspacePatchedName';
  // const TEST_WORKSPACE_PATCHED_DESC = 'Test workspace created by JS Clients (patched)';

  test('full sequence', async () => {
    const axiosConfig = await updateConfig(config, WORKSPACES_API_BASE);
    const convertedConfig: AxiosRequestConfig = await convertConfig(axiosConfig);
    // if workspace exists, delete it
    const findResult = await findWorkspaceByName(TEST_WORKSPACE_NAME, WorkspacesWorkspaceTypesQueryParam.Default, convertedConfig);
    if (findResult) {
      const deleteResp = await deleteWorkspace(findResult.id, convertedConfig);
      expect([200, 204]).toContain(deleteResp.status);
    }

    // create it
    const createResponse = await createWorkspace(TEST_WORKSPACE_NAME, TEST_WORKSPACE_DESC, convertedConfig);
    expect(createResponse.status).toEqual(201);
    const workspaceId = createResponse.data.uuid;
    // TODO: What is the parent ID of a new workspace?
    // const parentId = createResponse.data.parent_id;

    // list it, confirm it's in the list
    const findResult2 = await findWorkspaceByName(TEST_WORKSPACE_NAME, WorkspacesWorkspaceTypesQueryParam.Default, convertedConfig);
    expect(findResult2).toBeTruthy();

    await sleep(1000);

    // update it
    // const updateResult = await updateWorkspace(workspaceId, {name: TEST_WORKSPACE_UPDATED_NAME, description: TEST_WORKSPACE_UPDATED_DESC, parent_id: ""}, convertedConfig)

    // read it
    const readResult = await readWorkspace(workspaceId, false, convertedConfig);
    expect(readResult.status).toEqual(200);
    expect(readResult.data.name).toEqual(TEST_WORKSPACE_NAME);
    expect(readResult.data.description).toEqual(TEST_WORKSPACE_DESC);

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
