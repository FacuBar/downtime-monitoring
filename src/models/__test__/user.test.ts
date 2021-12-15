import { User } from '../user';
import { websiteSchema } from '../website';

const userTest = {
  name: 'oscar isaac',
  email: 'oscaac@gmail.com',
  password: 'somepassword',
};

const websiteTest = {
  url: 'google.com',
  notifyTo: 'oscaac@gmail.com',
  notify: true,
};
const websiteTest2 = {
  url: 'https://en.wikipedia.org/wiki/Oscar_Isaac',
  notifyTo: 'oscaac@gmail.com',
  notify: true,
};

it('websites should be an empty array by default', async () => {
  let user = User.build(userTest);
  await user.save();

  expect(user!.websites!.length).toEqual(0);
});

it('should add website to user document', async () => {
  // create and save user
  let user = User.build(userTest);
  user.addWebsite(websiteTest);
  user.addWebsite(websiteTest2);
  await user.save();

  // query created user
  const newUser = await User.findById(user._id);
  // assert required values
  expect(newUser!.websites.length).toEqual(2);
  expect(newUser!.websites[0].notifyTo).toEqual('oscaac@gmail.com');
  expect(newUser!.websites[1].url).toEqual(
    'https://en.wikipedia.org/wiki/Oscar_Isaac'
  );
});
