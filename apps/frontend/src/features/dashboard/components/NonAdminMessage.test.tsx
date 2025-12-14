import { render, screen } from '@/shared/utils/testUtils';
import { describe, it, expect } from 'vitest';
import { NonAdminMessage } from './NonAdminMessage';

describe('NonAdminMessage', () => {
  it('should render message text', () => {
    render(<NonAdminMessage />);
    expect(
      screen.getByText(
        'User management features are available to administrators only.'
      )
    ).toBeInTheDocument();
  });
});
