<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TopicController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:5,1');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::get('/research', [TopicController::class, 'index'])->name('topics.index');
    Route::post('/research/topics', [TopicController::class, 'store'])->name('topics.store');
    Route::post('/research/topics/{topic}/intake', [TopicController::class, 'intake'])->name('topics.intake');
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
});
