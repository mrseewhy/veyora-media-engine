<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CreateAdmin extends Command
{
    protected $signature = 'app:create-admin {email?}';
    protected $description = 'Create the first local administrator (no default credentials)';

    public function handle(): int
    {
        if (User::query()->exists()) {
            $this->error('An administrator already exists. No additional users are supported in v1.');
            return self::FAILURE;
        }

        $email = trim((string) ($this->argument('email') ?: $this->ask('Email')));
        $name = trim((string) $this->ask('Name', 'Editor'));
        $password = (string) $this->secret('Password (minimum 12 characters)');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12 || $name === '') {
            $this->error('Valid email, non-empty name and a password of at least 12 characters are required.');
            return self::FAILURE;
        }

        User::query()->create(['name' => $name, 'email' => $email, 'password' => Hash::make($password)]);
        $this->info('Local administrator created.');
        return self::SUCCESS;
    }
}
