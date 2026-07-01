import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminSettings from '../admin/pages/AdminSettings';
import useAdminStore from '../admin/store/adminStore';

describe('AdminSettings Component', () => {
  beforeEach(() => {
    // Reset Zustand store state to defaults before each test
    useAdminStore.setState({
      settings: {
        aiConfidenceThreshold: 0.80,
        duplicateSensitivity: 0.85,
        enableAutoResolve: false,
        autoCloseDays: 7,
        emailNotifications: false,
        adminAlerts: false
      }
    });
  });

  test('renders AI Settings and defaults correctly', () => {
    render(<AdminSettings />);
    
    expect(screen.getByText(/AI Confidence Threshold/i)).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    
    // Auto Resolve toggle should be rendered
    const toggles = screen.getAllByRole('button');
    // First toggle is auto resolve
    expect(toggles[0]).toHaveClass('bg-slate-200');
  });

  test('updates AI confidence threshold slider and Zustand store state', () => {
    render(<AdminSettings />);
    
    const sliders = screen.getAllByRole('slider');
    const thresholdSlider = sliders[0]; // aiConfidenceThreshold
    fireEvent.change(thresholdSlider, { target: { value: '0.65' } });
    
    // Threshold text should update to 65%
    expect(screen.getByText('65%')).toBeInTheDocument();
    
    // Store should update
    const state = useAdminStore.getState();
    expect(state.settings.aiConfidenceThreshold).toBe(0.65);
  });

  test('updates duplicate sensitivity slider and Zustand store state', () => {
    render(<AdminSettings />);
    
    const sliders = screen.getAllByRole('slider');
    const sensitivitySlider = sliders[1]; // duplicateSensitivity
    fireEvent.change(sensitivitySlider, { target: { value: '0.90' } });
    
    // Sensitivity text should update to 90%
    expect(screen.getByText('90%')).toBeInTheDocument();
    
    // Store should update
    const state = useAdminStore.getState();
    expect(state.settings.duplicateSensitivity).toBe(0.90);
  });

  test('toggles enable auto resolve and Zustand store state', () => {
    render(<AdminSettings />);
    
    const toggles = screen.getAllByRole('button');
    const autoResolveToggle = toggles[0];
    
    // Click toggle
    fireEvent.click(autoResolveToggle);
    
    // Store should update to true
    let state = useAdminStore.getState();
    expect(state.settings.enableAutoResolve).toBe(true);

    // Click again to turn off
    fireEvent.click(autoResolveToggle);
    state = useAdminStore.getState();
    expect(state.settings.enableAutoResolve).toBe(false);
  });
});
