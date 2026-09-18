package com.jat.jat.thread.domain;

public enum ThreadStatus {
    active,
    waiting_on_them,
    waiting_on_me,
    paused,
    closed_won,
    closed_lost,
    closed_ghosted
}
