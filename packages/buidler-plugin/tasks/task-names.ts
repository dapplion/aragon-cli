// Follows buidler source where task names are define in a single file
// to prevent typing errors when using `env.run(TASK_NAME)`

// Aragon app development commands
export const TASK_START = "start";
export const TASK_START_CLIENT = "start-client";
export const TASK_PUBLISH = "publish";
export const TASK_PUBLISH_GENERATE_ARTIFACTS = "publish:generate-artifacts";
export const TASK_PUBLISH_UPLOAD_ARTIFACTS = "publish:upload-artifacts";
export const TASK_DEPLOY = "deploy";

// APM commands
export const TASK_APM_PUBLISH = "apm-publish";
export const TASK_APM_VIEW = "apm-view";

// IPFS commands
export const TASK_IPFS_START = "ipfs-start";

// Built-in, from buidler
export const TASK_FLATTEN_GET_FLATTENED_SOURCE =
  "flatten:get-flattened-sources";
