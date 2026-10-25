# User Journey: Netflix style book browsing application

**What it is:** A personalized Netflix style browsing application centered around anyone being able to discover/find books and read other reader's logs. Users who are signed in are able to build a personal/private library where they can write logs about what they have read.

**General Public** No login is required. 

**On the home page** Books related to **technology** are displayed in a Netflix style layout which includes the book's cover, title, and author, followed by a brief synopsis of the book.  

**Performing a search** Only a search by title is possible. Any other search entry type(author, ISBN, or keyword) will result in a prompt to enter the book title only. Users will be able to browse books by genre. The available genres are as follows: Adventure, Technology, Horror, Sci-Fi, Fiction and Non-Fiction.  Wherever books are listed, there will be a **Load More** button at the bottom of page that when clicked, will load additional book results.

**Book viewing details page** Clicking on the book image modal card will navigate to its own route(for example, /books/:id) that will show the following from the Google Books API: title of the book, author(s), description of book, cover image,**(2 additional fields of my choice are needed)**.  Logs written by all users for the book should appear and each log should display the author's name and date the log was created.  This page should work when clicking on the book image as well as when the page is refreshed. 

**Authenticated users:**

**Sign up/login/logout** Require an email and a password via Supabase Auth. Every user will have a profile with a diplay name. Logs will show the display name, but the email address will never be displayed. 

**My Library** User can add a book to their library from the details page or elsewhere and remove it. 
Every entry in the library will have a reading status such as: want to read, reading or finished. The user will be able to change the reading status. This is the library's **update** operation. A user's library is private. A user can only see and manage their own library. 

**Logs** Users can write logs about what they have read and what they think of a book that is in their library. Each log will include a body of text and an optional 1-5 rating. Users have full CRUD authorization on their own logs, but can only view other user's logs. Logs can only exist for a book that is in the user's library. This rule must be strictly enforced, both in Supabase as well as in the UI. As soon as a book is removed from a library, the logs that were written in that library are deleted with it.

**Problem:** Display and organize books with all the required display information. 

**Who will use this application?** two types: the general public users with no authentication and authenticated users.  

## The journey

1. **Opens the webpage** → lands on **Home Page**. The home page appears with books related to **technology** displayed in a Netflix style layout which includes the book's cover, title, and author, followed by a brief description of the book.  
and at the top of the page and centered, from left to right appear the clickable words **Home**, **Genres** with a drop-down list of the genres that can be chosen by clicking on them, and finally a search bar. If user is logged in, the clickable word **My Library** will appear between **Home** and **Genre**.  Right under this top bar, appears: 
            "                     Welcome to BookDragon
     Unlimited Books. Anytime. Anywhere. A good book is just a dragon's breath away "  
      
      The word **BookDragon** is scarlet red color and is proceeded by a book dragon logo picture.
2. **Clicks on "Home"** at the top of the page → goes to **Home Page**. The results of any search appear with 20 modal images per page appear in rows of 5 by columns of 4 with the number of pages of results listed at the center of the bottom of the page.
3. **Entering book title and clicks on "search bar icon"** at the top of the page → goes to the search results for the entered title, which appear appear with 20 modal images per page appear in rows of 5 by columns of 4 with the number of pages of results listed at the center of the bottom of the page.
4. **Clicks on "Genres"** at the top of the page → opens a drop list under **Genres**. Once a listed genre is clicked on, the results of the genre search appear with 20 modal images per page appear in rows of 5 by columns of 4 with the number of pages of results listed at the center of the bottom of the page.
5. **Clicks on "modal book image"** go to chosen book. Clicking on the book image modal card will navigate to its own route(for example, /books/:id) that will show the following from the Google Books API: title of the book, author(s), description of book, cover image,**(2 additional fields of my choice are needed)**.  Logs written by all users for the book should appear and each log should display the author's name and date the log was created.  This page should work when clicking on the book image as well as when the page is refreshed. 


## Features
- Choice of genres, user is able to pick from a list, the selection will filter the movies and shows by that genre.
- For each book, it should have an image depicting it, and a short description within a card.
- Hovering over the modal book image highlights it, clicking on the card carries out the action listed as **5.** under **The Journey**.







