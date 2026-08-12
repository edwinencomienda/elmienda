<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * First-run setup. Claims the store by creating the one administrator, after
 * which EnsureSetupIsIncomplete makes these routes 404 forever.
 */
class SetupController extends Controller
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Show the setup form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/setup', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Create the first administrator and sign them in.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ]);

        $user = User::create($validated);

        // The person who claims the store is trusted by definition, so there is
        // nobody left to verify their address for them.
        $user->forceFill([
            'is_admin' => true,
            'email_verified_at' => now(),
        ])->save();

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('admin.dashboard');
    }
}
