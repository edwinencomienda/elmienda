<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectToSetupIfUnclaimed
{
    /**
     * Send admin visitors to first-run setup while the store has no
     * administrator, so a fresh install has one obvious entry point instead of
     * a login wall with no account to log into.
     *
     * This runs in the web group rather than on the admin routes because
     * middleware priority would otherwise let "auth" redirect to login first.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isAdminArea = $request->is('admin', 'admin/*')
            && ! $request->routeIs('admin.setup*');

        if ($isAdminArea && ! User::where('is_admin', true)->exists()) {
            return to_route('admin.setup');
        }

        return $next($request);
    }
}
