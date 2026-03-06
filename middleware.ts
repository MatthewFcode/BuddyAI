import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // doesnt run on the password (when we first load a site we send a plain GET request to the server for the sites content)
  // basically next.js specific (if it sits at the route run it on every request where it is protected init)
  // how does the middleware work
  // before the Next loads the page the request passes through the middleware function
  const auth = req.cookies.get('harry_auth')?.value // reading the cookie

  if (auth !== 'true') {
    return NextResponse.redirect(new URL('/', req.url)) // just redirecting back to the route
  }

  return NextResponse.next() // cookie is valid then let the through by default
}

export const config = {
  // this is just a matcher which tells middleware which routes to guard
  matcher: ['/harry/:path*', '/history/:path*'], // protects the harry route and anything under it /harry/anything
}
// we can add the api routes in here aswell
