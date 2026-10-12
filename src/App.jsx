
import { useState, useEffect } from 'react'
import './App.css'
import './style.css'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  const [books, setBooks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('libraryBooks')) || []
    } catch {
      return []
    }
  })

  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('libraryTransactions')) || []
    } catch {
      return []
    }
  })

  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('libraryUsers')) || []
    } catch {
      return []
    }
  })

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [quantity, setQuantity] = useState('1')

  const [borrower, setBorrower] = useState('')
  const [selectedBook, setSelectedBook] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    localStorage.setItem('libraryBooks', JSON.stringify(books))
  }, [books])

  useEffect(() => {
    localStorage.setItem(
      'libraryTransactions',
      JSON.stringify(transactions)
    )
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('libraryUsers', JSON.stringify(users))
  }, [users])

  const totalBooks = books.reduce(
    (total, book) => total + Number(book.quantity),
    0
  )

  const availableBooks = books.reduce(
    (total, book) => total + Number(book.available),
    0
  )

  const borrowedBooks = totalBooks - availableBooks

  function addBook(event) {
    event.preventDefault()

    if (!title.trim() || !author.trim() || !isbn.trim()) {
      alert('Please fill in all book details.')
      return
    }

    const quantityNumber = Number(quantity)

    if (!Number.isInteger(quantityNumber) || quantityNumber < 1) {
      alert('Quantity must be a whole number of at least 1.')
      return
    }

    if (
      books.some(
        book => book.isbn.toLowerCase() === isbn.trim().toLowerCase()
      )
    ) {
      alert('A book with this ISBN already exists.')
      return
    }

    const newBook = {
      id: Date.now(),
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      quantity: quantityNumber,
      available: quantityNumber
    }

    setBooks(previousBooks => [...previousBooks, newBook])

    setTitle('')
    setAuthor('')
    setIsbn('')
    setQuantity('1')
  }

  function deleteBook(id) {
    const hasActiveTransaction = transactions.some(
      transaction =>
        transaction.bookId === id &&
        transaction.status === 'Borrowed'
    )

    if (hasActiveTransaction) {
      alert('Return this book before deleting it.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this book?')) {
      return
    }

    setBooks(previousBooks =>
      previousBooks.filter(book => book.id !== id)
    )
  }

  function borrowBook(event) {
    event.preventDefault()

    if (!borrower.trim() || !selectedBook) {
      alert('Enter the borrower name and select a book.')
      return
    }

    const bookId = Number(selectedBook)
    const book = books.find(item => item.id === bookId)

    if (!book || Number(book.available) < 1) {
      alert('This book is currently unavailable.')
      return
    }

    const newTransaction = {
      id: Date.now(),
      bookId: book.id,
      bookTitle: book.title,
      borrower: borrower.trim(),
      borrowDate: new Date().toLocaleDateString(),
      returnDate: '',
      status: 'Borrowed'
    }

    setTransactions(previousTransactions => [
      ...previousTransactions,
      newTransaction
    ])

    setBooks(previousBooks =>
      previousBooks.map(item =>
        item.id === bookId
          ? { ...item, available: Number(item.available) - 1 }
          : item
      )
    )

    setBorrower('')
    setSelectedBook('')
  }

  function returnBook(transactionId) {
    const transaction = transactions.find(
      item => item.id === transactionId
    )

    if (!transaction || transaction.status !== 'Borrowed') {
      return
    }

    setTransactions(previousTransactions =>
      previousTransactions.map(item =>
        item.id === transactionId
          ? {
              ...item,
              status: 'Returned',
              returnDate: new Date().toLocaleDateString()
            }
          : item
      )
    )

    setBooks(previousBooks =>
      previousBooks.map(book =>
        book.id === transaction.bookId
          ? {
              ...book,
              available: Math.min(
                Number(book.quantity),
                Number(book.available) + 1
              )
            }
          : book
      )
    )
  }

  function addUser(event) {
    event.preventDefault()

    const cleanName = fullName.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName || !cleanEmail) {
      alert('Please enter the user’s full name and email.')
      return
    }

    if (users.some(user => user.email.toLowerCase() === cleanEmail)) {
      alert('A user with this email already exists.')
      return
    }

    const newUser = {
      id: Date.now(),
      fullName: cleanName,
      email: cleanEmail
    }

    setUsers(previousUsers => [...previousUsers, newUser])

    setFullName('')
    setEmail('')
  }

  function deleteUser(id) {
    const user = users.find(item => item.id === id)

    if (!user) return

    const hasActiveBorrowing = transactions.some(
      transaction =>
        transaction.borrower.toLowerCase() ===
          user.fullName.toLowerCase() &&
        transaction.status === 'Borrowed'
    )

    if (hasActiveBorrowing) {
      alert('Return this user’s borrowed books before deleting them.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    setUsers(previousUsers =>
      previousUsers.filter(item => item.id !== id)
    )
  }

  return (
    <div className="app">
      <header>
        <h1>Community Library</h1>
        <p>Library Management System</p>
      </header>

      <nav>
        {['Dashboard', 'Books', 'Transactions', 'Users'].map(page => (
          <button
            key={page}
            className={activePage === page ? 'active' : ''}
            onClick={() => setActivePage(page)}
          >
            {page}
          </button>
        ))}
      </nav>

      <main>
        {activePage === 'Dashboard' && (
          <section>
            <h2>Dashboard</h2>

            <div className="stats">
              <div className="stat-card">
                <h3>Total Books</h3>
                <p>{totalBooks}</p>
              </div>

              <div className="stat-card">
                <h3>Books Available</h3>
                <p>{availableBooks}</p>
              </div>

              <div className="stat-card">
                <h3>Books Borrowed</h3>
                <p>{borrowedBooks}</p>
              </div>

              <div className="stat-card">
                <h3>Book Titles</h3>
                <p>{books.length}</p>
              </div>

              <div className="stat-card">
                <h3>Registered Users</h3>
                <p>{users.length}</p>
              </div>
            </div>
          </section>
        )}

        {activePage === 'Books' && (
          <section>
            <h2>Books Management</h2>

            <form className="book-form" onSubmit={addBook}>
              <input
                type="text"
                placeholder="Book Title"
                value={title}
                onChange={event => setTitle(event.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={event => setAuthor(event.target.value)}
                required
              />

              <input
                type="text"
                placeholder="ISBN"
                value={isbn}
                onChange={event => setIsbn(event.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                min="1"
                step="1"
                value={quantity}
                onChange={event => setQuantity(event.target.value)}
                required
              />

              <button type="submit">Add Book</button>
            </form>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Quantity</th>
                    <th>Available</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.quantity}</td>
                      <td>{book.available}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => deleteBook(book.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {books.length === 0 && (
                    <tr>
                      <td colSpan="6">No books added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activePage === 'Transactions' && (
          <section>
            <h2>Book Transactions</h2>

            <h3>Borrow a Book</h3>

            <form className="book-form" onSubmit={borrowBook}>
              <input
                type="text"
                placeholder="Borrower's Name"
                value={borrower}
                onChange={event => setBorrower(event.target.value)}
                required
              />

              <select
                value={selectedBook}
                onChange={event => setSelectedBook(event.target.value)}
                required
              >
                <option value="">Select a book</option>

                {books
                  .filter(book => Number(book.available) > 0)
                  .map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} ({book.available} available)
                    </option>
                  ))}
              </select>

              <button type="submit">Borrow Book</button>
            </form>

            <h3>Transaction History</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Borrower</th>
                    <th>Book</th>
                    <th>Borrow Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.borrower}</td>
                      <td>{transaction.bookTitle}</td>
                      <td>{transaction.borrowDate}</td>
                      <td>{transaction.returnDate || '—'}</td>
                      <td>{transaction.status}</td>
                      <td>
                        {transaction.status === 'Borrowed' ? (
                          <button
                            onClick={() => returnBook(transaction.id)}
                          >
                            Return
                          </button>
                        ) : (
                          'Completed'
                        )}
                      </td>
                    </tr>
                  ))}

                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="6">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activePage === 'Users' && (
          <section>
            <h2>Users Management</h2>
            <p>Registered Users: {users.length}</p>

            <h3>Register a New User</h3>

            <form className="book-form" onSubmit={addUser}>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={event => setFullName(event.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />

              <button type="submit">Register User</button>
            </form>

            <h3>Registered Users</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4">No users registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
