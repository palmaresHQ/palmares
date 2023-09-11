import Response from ".";

export default class RedirectResponse {
  static async new(location: string): Promise<Response> {
    const response = await Response.new(302, { headers: {'Location': location}});
    return response;
  }
}
