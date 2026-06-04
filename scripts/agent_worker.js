#!/usr/bin/env node
// Simple Agent Worker example for MODAUI
// Polls /api/agents/worker/next, simulates work, then reports completion
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
    const data = await res.json();
    return data.task;
  } catch (e) {
    console.error('Lease error', e.message || e);
    return null;
  }
}

async function completeTask(task, result) {
  try {
    const res = await fetch(`${API_BASE}/api/agents/worker/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, result, logs: [`Completed by ${WORKER_ID}`] })
    });
    return await res.json();
  } catch (e) {
    console.error('Complete error', e.message || e);
    return null;
  }
}

async function doWork(task) {
  console.log(`[${WORKER_ID}] Working on task ${task.id} - ${task.title}`);
  // Simulate variable work time
  const ms = 2000 + Math.floor(Math.random() * 4000);
  await new Promise(r => setTimeout(r, ms));
  const result = `Simulated result by ${WORKER_ID} in ${ms}ms`;
  await completeTask(task, result);
  console.log(`[${WORKER_ID}] Completed task ${task.id}`);
}

async function loop() {
  while (true) {
    try {
      const task = await leaseTask();
      if (task) {
        await doWork(task);
      } else {
        // no task, sleep
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
      }
    } catch (e) {
      console.error('Worker loop error', e.message || e);
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
  }
}

(async () => {
  console.log(`Starting agent worker ${WORKER_ID}, API=${API_BASE}`);
  await loop();
})();
