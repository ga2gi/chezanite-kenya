<script>
    import { goto } from '$app/navigation';

    // Social links data
    const socialLinks = [
        { icon: '🐦', label: 'Twitter', url: 'https://twitter.com/chezanite' },
        { icon: '📘', label: 'Facebook', url: 'https://facebook.com/chezanite' },
        { icon: '📷', label: 'Instagram', url: 'https://instagram.com/chezanite' },
        { icon: '📺', label: 'YouTube', url: 'https://youtube.com/chezanite' }
    ];

    // Footer navigation sections
    const footerSections = [
        {
            title: 'Play',
            links: [
                { name: 'Nationwide', href: '/nationwide' },
                { name: 'Rooms', href: '/rooms' },
                { name: 'Tournaments', href: '/tournaments' },
                { name: 'Quick Play', href: '/quick-play' }
            ]
        },
        {
            title: 'Account',
            links: [
                { name: 'My Profile', href: '/profile' },
                { name: 'Leaderboard', href: '/leaderboard' },
                { name: 'Go Premium', href: '/premium' },
                { name: 'Settings', href: '/settings' }
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About Us', href: '/about' },
                { name: 'Blog', href: '/blog' },
                { name: 'Careers', href: '/careers' },
                { name: 'Press', href: '/press' }
            ]
        },
        {
            title: 'Support',
            links: [
                { name: 'Help Center', href: '/help' },
                { name: 'Contact Us', href: '/contact' },
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' }
            ]
        }
    ];

    let currentYear = new Date().getFullYear();

    // Handle navigation using SvelteKit's goto
    function handleLinkClick(href, event) {
        event.preventDefault();
        goto(href);
    }
</script>

<svelte:head>
    <style>
        .chezanite-footer {
            background-color: #0D1B2A; /* Deep navy blue */
            color: #ffffff;
            padding: 2rem 1rem;
            margin-top: auto;
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
        }

        .footer-section h4 {
            color: #ffd700;
            margin-bottom: 1rem;
            font-size: 1.1rem;
            font-weight: 600;
        }

        .footer-section ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .footer-section ul li {
            margin-bottom: 0.5rem;
        }

        .footer-section a {
            color: #e0e0e0;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .footer-section a:hover,
        .footer-section a:focus {
            color: #ffd700;
            transform: translateX(2px);
            outline: none;
        }

        .social-links {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .social-links a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transition: all 0.3s ease;
            font-size: 1.2rem;
            text-decoration: none;
        }

        .social-links a:hover,
        .social-links a:focus {
            background: #ffd700;
            transform: translateY(-2px);
            color: #0D1B2A;
            outline: none;
        }

        .app-download p {
            margin-bottom: 0.5rem;
            color: #e0e0e0;
            font-size: 0.9rem;
        }

        .download-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .download-button {
            display: inline-block;
            background: white;
            color: #0D1B2A;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.8rem;
            text-align: center;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .download-button:hover,
        .download-button:focus {
            background: #ffd700;
            color: #0D1B2A;
            transform: translateY(-1px);
            border-color: #ffd700;
            outline: none;
        }

        .footer-bottom {
            max-width: 1200px;
            margin: 2rem auto 0;
            padding-top: 2rem;
            border-top: 1px solid #3949ab;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .footer-logo {
            display: flex;
            flex-direction: column;
        }

        .footer-logo strong {
            color: #ffd700;
            font-size: 1.5rem;
            font-weight: 700;
        }

        .footer-logo span {
            color: #e0e0e0;
            font-size: 0.8rem;
            margin-top: 0.2rem;
        }

        .copyright {
            text-align: right;
            color: #b0bec5;
            font-size: 0.8rem;
        }

        .copyright p {
            margin: 0.2rem 0;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .footer-content {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
            }

            .footer-bottom {
                flex-direction: column;
                text-align: center;
                align-items: center;
            }

            .copyright {
                text-align: center;
            }

            .social-links {
                justify-content: center;
            }

            .download-buttons {
                align-items: center;
            }
        }

        @media (max-width: 480px) {
            .footer-content {
                grid-template-columns: 1fr;
                text-align: center;
            }

            .chezanite-footer {
                padding: 1.5rem 1rem;
            }
        }
    </style>
</svelte:head>

<footer class="chezanite-footer">
    <div class="footer-content">
        {#each footerSections as section}
            <div class="footer-section">
                <h4>{section.title}</h4>
                <ul>
                    {#each section.links as link}
                        <li>
                            <a
                                href={link.href}
                                on:click|preventDefault={(event) => handleLinkClick(link.href, event)}
                                aria-label={link.name}
                            >
                                {link.name}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/each}
        
        <!-- Connect Section -->
        <div class="footer-section">
            <h4>Connect</h4>
            <div class="social-links">
                {#each socialLinks as social}
                    <a
                        href={social.url}
                        aria-label={social.label}
                        on:click|preventDefault={(event) => handleLinkClick(social.url, event)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {social.icon}
                    </a>
                {/each}
            </div>
            <div class="app-download">
                <p>Get the app</p>
                <div class="download-buttons">
                    <a
                        href="#"
                        class="download-button"
                        on:click|preventDefault={() => handleLinkClick('/download/android')}
                    >
                        Google Play
                    </a>
                    <a
                        href="#"
                        class="download-button"
                        on:click|preventDefault={() => handleLinkClick('/download/ios')}
                    >
                        App Store
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer-bottom">
        <div class="footer-logo">
            <strong>ChezaNite</strong>
            <span>Game Nights Made Awesome!</span>
        </div>
        <div class="copyright">
            <p>&copy; {currentYear} ChezaNite. All rights reserved.</p>
            <p>Made with ♥ for Kenya</p>
        </div>
    </div>
</footer>