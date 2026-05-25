import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateTicket from '../user/pages/CreateTicket';
import { MemoryRouter } from 'react-router-dom';
import { mockedNavigate } from '../../jest.setup';

// Mock translation service
jest.mock('../services/translationService', () => ({
  translateText: jest.fn((text) => Promise.resolve(text)),
  SUPPORTED_LANGUAGES: [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' }
  ]
}));

describe('CreateTicket Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the CreateTicket component in manual mode by default', () => {
    render(
      <MemoryRouter>
        <CreateTicket />
      </MemoryRouter>
    );
    expect(screen.getByText('Report a New Issue')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe your problem/i)).toBeInTheDocument();
  });

  test('pre-fills title and renders dynamic form fields when a template is activated', async () => {
    render(
      <MemoryRouter>
        <CreateTicket />
      </MemoryRouter>
    );

    // Select the VPN Connectivity template button
    const vpnBtn = screen.getByText('VPN Connectivity Issue');
    fireEvent.click(vpnBtn);

    // Click on "Use This Template" button to activate
    const useTemplateBtn = screen.getByRole('button', { name: /Use This Template/i });
    fireEvent.click(useTemplateBtn);

    // Check if the title input is now pre-filled
    const titleInput = screen.getByPlaceholderText(/Brief summary of your issue/i);
    expect(titleInput.value).toBe('Unable to connect to company VPN');

    // Check if the dynamic form fields appear
    expect(screen.getByLabelText(/Error Message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Device & OS/i)).toBeInTheDocument();
  });

  test('serializes fields correctly and navigates to AI processing on submit', async () => {
    render(
      <MemoryRouter>
        <CreateTicket />
      </MemoryRouter>
    );

    // Select and activate template
    const vpnBtn = screen.getByText('VPN Connectivity Issue');
    fireEvent.click(vpnBtn);
    const useTemplateBtn = screen.getByRole('button', { name: /Use This Template/i });
    fireEvent.click(useTemplateBtn);

    // Fill in required fields
    const errorTextarea = screen.getByPlaceholderText(/Paste the exact error here/i);
    fireEvent.change(errorTextarea, { target: { value: 'Connection timeout error 404' } });

    const deviceInput = screen.getByPlaceholderText(/e.g., Windows 11 laptop/i);
    fireEvent.change(deviceInput, { target: { value: 'Windows 11 PC' } });

    // Select dropdown options
    const locationSelect = screen.getByLabelText(/Location/i);
    fireEvent.change(locationSelect, { target: { value: 'Home WiFi' } });

    const internetSelect = screen.getByLabelText(/Internet Status/i);
    fireEvent.change(internetSelect, { target: { value: 'Working' } });

    // Submit the form
    const submitBtn = screen.getByRole('button', { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    // Verify navigation was triggered with serialized state
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalled();
    });

    const navArgs = mockedNavigate.mock.calls[0];
    expect(navArgs[0]).toBe('/ai-processing');
    
    const state = navArgs[1].state;
    expect(state.ticket_title).toBe('Unable to connect to company VPN');
    expect(state.template_used).toBe(true);
    expect(state.original_text).toContain('Error Message: Connection timeout error 404');
    expect(state.original_text).toContain('Device & OS: Windows 11 PC');
    expect(state.original_text).toContain('Location: Home WiFi');
    expect(state.original_text).toContain('Internet Status: Working');
  });
});
