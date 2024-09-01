import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import UserDAO from '../dao/models/userDAO.js';
import CartService from '../services/cart.services.js';
import config from '../config/config.js';

const JWT_SECRET = config.jwt_secret;

const initializePassport = () => {
  const userDAO = new UserDAO(config.data_source);

  // Estrategia de login local
  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await userDAO.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }
          const isValidPassword = bcrypt.compareSync(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: 'Incorrect password' });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Estrategia de registro local
  passport.use(
    'register',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          console.log('Register strategy invoked'); // Verificación
          const existingUser = await userDAO.getUserByEmail(email);
          if (existingUser) {
            return done(null, false, { message: 'Email already taken' });
          }
          const hashedPassword = bcrypt.hashSync(
            password,
            bcrypt.genSaltSync(10)
          );

          const newCart = await CartService.createCart([]);

          const newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email,
            password: hashedPassword,
            age: req.body.age,
            cart: newCart._id,
          };

          const createdUser = await userDAO.createUser(newUser);

          // Verificar y asegurar que _id está presente
          if (!createdUser._id) {
            console.error('Error: createdUser does not have _id');
            return done(null, false, { message: 'Error creating user' });
          }
          return done(null, createdUser);
        } catch (err) {
          console.error('Error during user creation:', err); // Depuración
          return done(err);
        }
      }
    )
  );

  // Estrategia de autenticación JWT
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await userDAO.getUserById(jwt_payload.id);
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  // Estrategia de autenticación con GitHub
  passport.use(
    new GithubStrategy(
      {
        clientID: config.githubClientID,
        clientSecret: config.githubClientSecret,
        callbackURL: config.githubCallbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('GitHub Profile:', profile);
          let user = await userDAO.getUserByEmail(profile.emails[0].value);
          if (!user) {
            const newCart = await CartService.createCart([]);

            const newUser = {
              first_name: profile.displayName || 'N/A',
              last_name: '',
              email: profile.emails[0].value,
              password: '',
              age: 0,
              cart: newCart._id,
            };
            user = await userDAO.createUser(newUser);
          }
          console.log('Authenticated User:', user);
          return done(null, user);
        } catch (err) {
          console.error('Error in GitHub strategy:', err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user._id || user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userDAO.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default initializePassport;
