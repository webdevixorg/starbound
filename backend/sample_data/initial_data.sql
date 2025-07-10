-- Dumping data for table `auth_user`
INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$720000$GfgZneAcLEHlT7MnPDDQUM$BcHhwYfKGb3rYn1DIUw8X4NgPK5J3CBllI2hXl+9huw=', NULL, 0, 'johndoe', 'John', 'Doe', 'johndoe@elegantinspire.com', 1, 1, '2024-07-18 19:11:49');

-- Dumping data for table `profiles_profile`
INSERT INTO `profiles_profile` (`id`, `image`, `bio`, `user_id`, `address`, `city`, `country`, `date_of_birth`, `phone`, `postal_code`, `region`) VALUES
(1, '1.jpg', 'I am a Doctor', 1, '123 Main St', 'San Francisco', 'USA', '1990-05-15', '4155557890', '94105', 'California');

-- Dumping data for table `app_category`
INSERT INTO `app_post_category` (`id`, `name`, `slug`) VALUES
(1, 'Web Development', 'web-development'),
(2, 'Backend Development', 'backend-development'),
(3, 'Database Management', 'database-management'),
(4, 'DevOps', 'devops');

-- Dumping data for table `app_post`
INSERT INTO `app_post` (`id`, `slug`, `category_id`, `title`, `description`, `user_id`, `date`) VALUES
(1, 'my-first-portfolio', 1, 'My First Portfolio', 'Portfolio description', 1, '2024-01-01 10:00:00'),
(2, 'react-projects', 1, 'React Projects', 'React projects description', 1, '2024-02-01 11:00:00'),
(3, 'nodejs-backend', 2, 'Node.js Backend Development', 'Node.js backend description', 1, '2024-03-01 12:00:00'),
(4, 'database-design', 3, 'Database Design Principles', 'Database design description', 1, '2024-04-01 13:00:00'),
(5, 'devops-best-practices', 4, 'DevOps Best Practices', 'DevOps practices description', 1, '2024-05-01 14:00:00');

-- Dumping data for table `app_post_image`
INSERT INTO `app_post_image` (`id`, `image`, `alt`, `post_id`) VALUES
(1, 'images/posts/img1.jpg', 'Portfolio 1 Image 1', 1),
(2, 'images/posts/img2.jpg', 'Portfolio 1 Image 2', 1),
(3, 'images/posts/img3.jpg', 'React Projects Image 1', 2),
(4, 'images/posts/img4.jpg', 'React Projects Image 2', 2),
(5, 'images/posts/img5.jpg', 'Node.js Backend Image 1', 3),
(6, 'images/posts/img6.jpg', 'Node.js Backend Image 2', 3),
(7, 'images/posts/img7.jpg', 'Database Design Image 1', 4),
(8, 'images/posts/img8.jpg', 'Database Design Image 2', 4),
(9, 'images/posts/img9.jpg', 'DevOps Best Practices Image 1', 5),
(10, 'images/posts/img10.jpg', 'DevOps Best Practices Image 2', 5);

-- Dumping data for table `app_post_visitor_count`
INSERT INTO `app_post_visitor_count` (`id`, `count`, `post_id`, `date`) VALUES
(11, 10, 1, '2024-06-01 10:00:00'),
(12, 15, 1, '2024-06-08 10:00:00'),
(13, 20, 1, '2024-06-15 10:00:00'),
(14, 25, 1, '2024-07-01 10:00:00'),
(15, 30, 1, '2024-07-08 10:00:00'),
(16, 35, 1, '2024-07-15 10:00:00'),
(17, 10, 2, '2024-06-01 10:00:00'),
(18, 15, 2, '2024-06-08 10:00:00'),
(19, 20, 2, '2024-06-15 10:00:00'),
(20, 25, 2, '2024-07-01 10:00:00'),
(21, 30, 2, '2024-07-08 10:00:00'),
(22, 35, 2, '2024-07-15 10:00:00'),
(23, 10, 3, '2024-06-01 10:00:00'),
(24, 15, 3, '2024-06-08 10:00:00'),
(25, 20, 3, '2024-06-15 10:00:00'),
(26, 25, 3, '2024-07-01 10:00:00'),
(27, 30, 3, '2024-07-08 10:00:00'),
(28, 35, 3, '2024-07-15 10:00:00'),
(29, 10, 4, '2024-06-01 10:00:00'),
(30, 15, 4, '2024-06-08 10:00:00'),
(31, 20, 4, '2024-06-15 10:00:00'),
(32, 25, 4, '2024-07-01 10:00:00'),
(33, 30, 4, '2024-07-08 10:00:00'),
(34, 35, 4, '2024-07-15 10:00:00'),
(35, 10, 5, '2024-06-01 10:00:00'),
(36, 15, 5, '2024-06-08 10:00:00'),
(37, 20, 5, '2024-06-15 10:00:00'),
(38, 25, 5, '2024-07-01 10:00:00'),
(39, 30, 5, '2024-07-08 10:00:00'),
(40, 35, 5, '2024-07-15 10:00:00');

-- Dumping data for table `app_aggregated_visitor_count`
INSERT INTO `app_aggregated_visitor_count` (`id`, `data`, `updated_at`, `post_id`) VALUES
(1, '{\"weekly_count\": 35, \"monthly_count\": 125, \"three_month_count\": 210, \"six_month_count\": 210, \"yearly_count\": 210, \"all_time_count\": 210}', '2024-07-20 12:00:00', 1),
(2, '{\"weekly_count\": 35, \"monthly_count\": 125, \"three_month_count\": 210, \"six_month_count\": 210, \"yearly_count\": 210, \"all_time_count\": 210}', '2024-07-20 12:00:00', 2),
(3, '{\"weekly_count\": 35, \"monthly_count\": 125, \"three_month_count\": 210, \"six_month_count\": 210, \"yearly_count\": 210, \"all_time_count\": 210}', '2024-07-20 12:00:00', 3),
(4, '{\"weekly_count\": 85, \"monthly_count\": 125, \"three_month_count\": 310, \"six_month_count\": 510, \"yearly_count\": 710, \"all_time_count\": 1210}', '2024-07-20 12:00:00', 4),
(5, '{\"weekly_count\": 35, \"monthly_count\": 125, \"three_month_count\": 210, \"six_month_count\": 210, \"yearly_count\": 210, \"all_time_count\": 210}', '2024-07-20 12:00:00', 5),
(6, '{\"weekly_count\": 35, \"monthly_count\": 140, \"three_month_count\": 250, \"six_month_count\": 310, \"yearly_count\": 450, \"all_time_count\": 600}', '2024-07-20 12:00:00', 1),
(7, '{\"weekly_count\": 50, \"monthly_count\": 160, \"three_month_count\": 270, \"six_month_count\": 330, \"yearly_count\": 480, \"all_time_count\": 650}', '2024-07-20 12:00:00', 2),
(8, '{\"weekly_count\": 45, \"monthly_count\": 130, \"three_month_count\": 260, \"six_month_count\": 320, \"yearly_count\": 470, \"all_time_count\": 640}', '2024-07-20 12:00:00', 3),
(9, '{\"weekly_count\": 40, \"monthly_count\": 120, \"three_month_count\": 240, \"six_month_count\": 300, \"yearly_count\": 440, \"all_time_count\": 600}', '2024-07-20 12:00:00', 4),
(10, '{\"weekly_count\": 30, \"monthly_count\": 110, \"three_month_count\": 230, \"six_month_count\": 290, \"yearly_count\": 420, \"all_time_count\": 580}', '2024-07-20 12:00:00', 5);
