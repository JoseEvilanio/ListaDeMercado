import React from 'react';
import useResponsive from '../hooks/useResponsive';

/**
 * Example component demonstrating the responsive grid system
 */
const ResponsiveGridExample: React.FC = () => {
  const { breakpoint, orientation, isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className="container responsive-padding">
      <h2 className="responsive-heading">Responsive Grid System</h2>
      
      <div className="responsive-margin">
        <p className="responsive-text">
          Current breakpoint: <strong>{breakpoint}</strong> | 
          Orientation: <strong>{orientation}</strong> | 
          Device type: <strong>
            {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
          </strong>
        </p>
      </div>
      
      <h3>Basic Grid</h3>
      <div className="grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
          <div 
            key={item}
            className={`
              col-span-2
              sm:col-span-4
              lg:col-span-3
              responsive-padding
            `}
            style={{
              backgroundColor: 'var(--color-primary-100)',
              border: '1px solid var(--color-primary-300)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center',
              padding: 'var(--spacing-4)'
            }}
          >
            Grid Item {item}
          </div>
        ))}
      </div>
      
      <h3 className="mt-8">Responsive Card Layout</h3>
      <div className="auto-grid">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="card">
            <div className="card-header">
              <h4>Card {item}</h4>
            </div>
            <div className="card-body">
              <p>This card layout automatically adjusts based on available space.</p>
            </div>
            <div className="card-footer">
              <button className="btn btn-primary">Action</button>
            </div>
          </div>
        ))}
      </div>
      
      <h3 className="mt-8">Responsive Visibility</h3>
      <div className="responsive-margin">
        <p className="hide-mobile">This text is hidden on mobile devices.</p>
        <p className="hide-tablet">This text is hidden on tablet devices.</p>
        <p className="hide-desktop">This text is hidden on desktop devices.</p>
        <p className="hide-portrait">This text is hidden in portrait orientation.</p>
        <p className="hide-landscape">This text is hidden in landscape orientation.</p>
      </div>
      
      <h3 className="mt-8">Responsive Flexbox</h3>
      <div className="flex flex-direction-column sm:flex-direction-row responsive-margin">
        <div 
          style={{
            backgroundColor: 'var(--color-secondary-100)',
            border: '1px solid var(--color-secondary-300)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--spacing-4)',
            flex: 1,
            margin: 'var(--spacing-2)'
          }}
        >
          Flex Item 1
        </div>
        <div 
          style={{
            backgroundColor: 'var(--color-secondary-100)',
            border: '1px solid var(--color-secondary-300)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--spacing-4)',
            flex: 1,
            margin: 'var(--spacing-2)'
          }}
        >
          Flex Item 2
        </div>
        <div 
          style={{
            backgroundColor: 'var(--color-secondary-100)',
            border: '1px solid var(--color-secondary-300)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--spacing-4)',
            flex: 1,
            margin: 'var(--spacing-2)'
          }}
        >
          Flex Item 3
        </div>
      </div>
      
      <h3 className="mt-8">Responsive Table</h3>
      <div className="table-responsive">
        <table className="table table-mobile-cards">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
              { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
              { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Pending' },
            ].map((user) => (
              <tr key={user.id}>
                <td data-label="ID">{user.id}</td>
                <td data-label="Name">{user.name}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Status">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <h3 className="mt-8">Responsive Form</h3>
      <form>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input type="text" className="form-control" id="firstName" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lastName">Last Name</label>
            <input type="text" className="form-control" id="lastName" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input type="email" className="form-control" id="email" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="message">Message</label>
          <textarea className="form-control" id="message" rows={4}></textarea>
        </div>
        <button type="submit" className="btn btn-primary btn-mobile-block">Submit</button>
      </form>
    </div>
  );
};

export default ResponsiveGridExample;