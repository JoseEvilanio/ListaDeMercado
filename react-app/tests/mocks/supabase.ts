// Mock para o cliente Supabase
export const mockSupabaseClient = {
  auth: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn()
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    csv: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null }))),
    catch: jest.fn().mockImplementation(callback => Promise.resolve(callback(null)))
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn(),
      download: jest.fn(),
      getPublicUrl: jest.fn(),
      list: jest.fn(),
      remove: jest.fn()
    })
  },
  channel: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    unsubscribe: jest.fn(),
    track: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  })
};

// Mock para o hook useSupabase
export const mockUseSupabase = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com'
  },
  session: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_at: Date.now() + 3600000
  },
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  loading: false
};

// Função para configurar mocks específicos
export const setupSupabaseMock = (customMocks = {}) => {
  return {
    ...mockSupabaseClient,
    ...customMocks
  };
};

// Função para configurar resposta de consulta
export const mockQueryResponse = (data: any, error: any = null) => {
  return {
    data,
    error,
    count: Array.isArray(data) ? data.length : 0
  };
};