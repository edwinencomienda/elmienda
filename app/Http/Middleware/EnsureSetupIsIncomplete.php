<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSetupIsIncomplete
{
    /**
     * Keep the first-run setup screen reachable only while no administrator
     * exists. A 404 (rather than a redirect) means nobody can probe whether
     * the store is still claimable.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_if(User::where('is_admin', true)->exists(), 404);

        return $next($request);
    }
}
