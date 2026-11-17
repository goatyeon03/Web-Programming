## Travel Destination Information Website

This web application provides map-based information about nearby **tourist attractions, cafés, and restaurants** based on a location entered by the user.

It was built as a simple web application using a **Flask backend** and **HTML templates**.

### 1. Key Features

- 📍 **Location-Based Search**  
  Find nearby places based on the area entered in the search bar.
- 🗺 **Map Visualization**  
  Display place locations as markers on a map.
- 🏠 **Category-Based Browsing**  
  Explore places by category, such as cafés, restaurants, and tourist attractions.
- 🌐 **Web Interface**  
  Access the service through a web interface.

### 2. Project Structure

```text
Web-Programming/
│
├── app.py                 # Main Flask server
├── requirements.txt       # Python dependencies
├── README.md              # Project documentation
│
├── templates/             # HTML templates
│   └── *.html
│
├── static/                # Static files (CSS, JS, images, etc.)
│   ├── css/
│   ├── js/
│   └── images/
│
├── 웹개발_관련문서/        # Project-related documents
│
├── Procfile               # Deployment process configuration
└── app.yaml               # Deployment configuration
```

### 3. How to Use

1. On the main page, select the category you want to explore: **Cafés**, **Restaurants**, or **Tourist Attractions**.
2. On the next page, enter a neighborhood or area in the search bar.
3. Nearby places in the selected category will appear as markers on **Google Maps**.
4. Click a marker to view available place details, such as its location, reviews, and opening hours, provided by the **Places API**.
5. Next to the map, browse cards featuring **Naver Blog posts** related to the selected area or a particular place.
6. Use the filter button to display only posts containing specific keywords.
7. Click a card to flip it over and view a summary of the post and a link to the original article.
8. Click the link to open the corresponding blog post.

### 4. Tech Stack

- **Backend**
  - Python
  - Flask
- **Frontend**
  - HTML
  - CSS
  - JavaScript
- **Other Tools & Services**
  - Map APIs (including Google Maps)
  - Git / GitHub

### 5. Future Improvements

- [ ] Add user authentication and login functionality.
- [ ] Improve sorting and filtering of search results.
- [ ] Enhance the UI/UX.
- [ ] Optimize the interface for mobile devices.

### 6. Demo Video

[Watch the Website Demo](https://youtu.be/DMAESJbLS3o)

### 7. Author

**Yang Soyeon (양소연)**  
- GitHub: https://github.com/goatyeon03
- Email: uaua1595@naver.com / yangsoyeon1123@gmail.com
