import Response from '../response';
import { HTTP_200_OK } from '../response/status';
import { path } from '../router';
import { generateErrorId } from '../utils/error-id';
import { launchEditor } from '../utils/launch-editor-on-error';

let errorId: string | undefined = undefined;

export function getErrorId() {
  return errorId;
}

/**
 * When the user clicks on the error on the error handling page we can open the file where the bug occurred
 * on the editor. So we just call this endpoint and it will automatically open the file on the editor.
 *
 * There are some gotchas e need to be aware of:
 * 1 - The path should not clash with the user's routes, so we generate it automatically and randomized so we
 * don't have the problem of clashing route names.
 * 2 - We need to use a POST request because we need to send the file, line and column where the error occurred.
 */
export default function errorCaptureHandler() {
  errorId = generateErrorId();
  return path(`/${errorId}`).post(async (request) => {
    const body = await request.json();
    const { errorColumn, errorFile, errorLine } = body as { errorFile: string; errorLine: number; errorColumn: number };
    launchEditor(errorFile, errorLine, errorColumn);
    return new Response(undefined, { status: HTTP_200_OK });
  });
}
