#!/usr/bin/env node
// CommonJS worker compatible with project "type": "module"
const fetch = require('node-fetch');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || 5000);
const WORKER_ID = process.env.WORKER_ID || `worker_${Math.random().toString(36).slice(2,8)}`;

async function leaseTask() {
  try {
    const res = await fetch(`${API_BASE}/api/agents/worker/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: WORKER_ID })
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Lease failed to parse JSON response', parseError.message || parseError);
      console.error('Response status:', res.status, 'body:', text);
      return { task: null };
    }
  } catch (e) {
    console.error('Lease error', e.message || e);
    return { task: null };
  }
}

async function completeTask(task, result) {
  try {
    const res = await fetch(`${API_BASE}/api/agents/worker/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, result, logs: [`Completed by ${WORKER_ID}`] })
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Complete failed to parse JSON response', parseError.message || parseError);
      console.error('Response status:', res.status, 'body:', text);
      return null;
    }
  } catch (e) {
    console.error('Complete error', e.message || e);
    return null;
  }
}

async function doWork(task) {
  console.log(`[${WORKER_ID}] Working on task ${task.id} - ${task.title}`);
  const ms = 2000 + Math.floor(Math.random() * 4000);
  await new Promise(r => setTimeout(r, ms));
  const result = `Simulated result by ${WORKER_ID} in ${ms}ms`;
  await completeTask(task, result);
  console.log(`[${WORKER_ID}] Completed task ${task.id}`);
}

async function loop() {
  while (true) {
    try {
      const leased = await leaseTask();
      const task = leased.task || null;
      if (task) {
        await doWork(task);
      } else {
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
      }
    } catch (e) {
      console.error('Worker loop error', e.message || e);
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
  }
}

console.log(`Starting agent worker ${WORKER_ID}, API=${API_BASE}`);
loop();
