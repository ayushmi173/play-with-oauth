import app from '../server/app';
import { RootRouter } from '../routes/root.route';
import { PORT } from '../utils/config';
import { COLORS } from '../utils/helpers';

app.use(RootRouter);

app.listen(PORT, (): void => {
  console.log(COLORS.FgMagenta, `Server is listening on ${PORT} ✅`);
});
