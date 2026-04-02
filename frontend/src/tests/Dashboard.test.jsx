import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import { alertsAPI, usersAPI, teamsAPI } from '../api/client';

// Mock API client
vi.mock('../api/client', () => ({
  alertsAPI: { list: vi.fn(), logs: vi.fn(), acknowledge: vi.fn(), resolve: vi.fn() },
  usersAPI: { list: vi.fn() },
  teamsAPI: { list: vi.fn() },
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    usersAPI.list.mockResolvedValue({ data: [{ _id: 'u1', name: 'Test User' }] });
    teamsAPI.list.mockResolvedValue({ data: [{ _id: 't1', name: 'SRE Team' }] });
    
    alertsAPI.list.mockResolvedValue({
      data: [
        { 
          _id: 'alert1', 
          title: 'Database Spiking', 
          severity: 'critical', 
          status: 'triggered', 
          assignedTo: 't1', 
          assignedType: 'team', 
          createdAt: new Date().toISOString() 
        },
      ],
    });
  });

  it('renders dashboard statistics and table successfully', async () => {
    render(<Dashboard />);
    
    // Should initially show skeleton or loading
    expect(document.querySelector('.skeleton')).toBeInTheDocument();

    // Wait for the alerts to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('Database Spiking')).toBeInTheDocument();
    });

    // Verify stats appear
    expect(screen.getByText('Total Alerts')).toBeInTheDocument();
    expect(screen.getByText('Triggered')).toBeInTheDocument();

    // The name of the team should resolve
    expect(screen.getByText('SRE Team')).toBeInTheDocument();
  });
});
