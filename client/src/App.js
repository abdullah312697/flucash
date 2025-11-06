import  { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Loading from './frontend/client/components/Spinner'; // Import the Loading component

// Lazy load visitor components
const UserLayout = lazy(() => import('./UserLayout'));
const Main = lazy(() => import('./frontend/client/components/Main'));
const Cart = lazy(() => import('./frontend/client/components/Cart'));
const Product = lazy(() => import('./frontend/client/components/Product'));
const Checkout = lazy(() => import('./frontend/client/components/Checkout'));
const Contact = lazy(() => import('./frontend/client/components/Contact'));
const Register = lazy(() => import('./frontend/client/components/Register'));
const EmailVerify = lazy(() => import('./frontend/client/components/EmailVerify'));
const Login = lazy(() => import('./frontend/client/components/Login'));
const Thanks = lazy(() => import('./frontend/client/components/Thanks'));
const TrackOrder = lazy(() => import('./frontend/client/components/TrackOrder'));
const CancelOrder = lazy(() => import('./frontend/client/components/CancelOrder'));
const ReturnOrder = lazy(() => import('./frontend/client/components/ReturnOrder'));
const SetTarget = lazy(() => import('./frontend/client/components/SetTarget'));
const ViewGoal = lazy(() => import('./frontend/client/components/ViewGoal'));
const EditGoal = lazy(() => import('./frontend/client/components/EditGoal'));
const Employee = lazy(() => import('./frontend/client/components/Employee'));
const AddProducts = lazy(() => import('./frontend/client/components/AddProducts'));
const ViewProduct = lazy(() => import('./frontend/client/components/ViewProduct'));
const EditProductCl = lazy(() => import('./frontend/client/components/EditProduct'));

// Lazy load dashboard components
const DeshbordLayout = lazy(() => import('./DeshbordLayout'));
const LoginDesh = lazy(() => import('./frontend/deshbord/components/LoginDesh'));
const MainDesh = lazy(() => import('./frontend/deshbord/components/MainDesh'));
const AddProduct = lazy(() => import('./frontend/deshbord/components/AddProduct'));
const Calendar = lazy(() => import('./frontend/deshbord/components/calender/Calendar'));
const LogoandName = lazy(() => import('./frontend/deshbord/components/LogoandName'));
const AddSliderData = lazy(() => import('./frontend/deshbord/components/AddSliderData'));
const MyProduct = lazy(() => import('./frontend/deshbord/components/MyProduct'));
const EditProduct = lazy(() => import('./frontend/deshbord/components/EditProduct'));
const AllOrder = lazy(() => import('./frontend/deshbord/components/AllOrder'));
const CustomerContact = lazy(() => import('./frontend/deshbord/components/CustomerContact'));
const UpdateOrderStatus = lazy(() => import('./frontend/deshbord/components/UpdateOrderStatus'));
const Campaign = lazy(() => import('./frontend/deshbord/components/Campaign'));

function App() {
  return (
    <div className="mainContainer">
      <div className="ComponentsPr">
        <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
          {/* Use the Loading component as a fallback */}
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<UserLayout />}>
                <Route index element={<Main />} />
                <Route path="cart" element={<Cart />} />
                <Route path="product/:productId" element={<Product />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="contact" element={<Contact />} />
                <Route path="register" element={<Register />} />
                <Route path="verifyemail" element={<EmailVerify />} />
                <Route path="login" element={<Login />} />
                <Route path="thanks" element={<Thanks />} />
                <Route path="trackorder" element={<TrackOrder />} />
                <Route path="cancelorder" element={<CancelOrder />} />
                <Route path="returnorder" element={<ReturnOrder />} />
                <Route path="settarget" element={<SetTarget />} />
                <Route path="viewgoal/:goalId" element={<ViewGoal />} />
                <Route path="updategoal/:goalId" element={<EditGoal />} />
                <Route path="theemployee/:employeeId" element={<Employee />} />
                <Route path="addproduct" element={<AddProducts />} />
                <Route path="viewproduct/:productId" element={<ViewProduct />} />
                <Route path="editproduct/:productId" element={<EditProductCl />} />
                <Route path="*" element={<div className="errPageStyle">404 not Found</div>} />
              </Route>
              <Route path="/newking" element={<DeshbordLayout />}>
                <Route index element={<LoginDesh />} />
                <Route path="deshbord" element={<MainDesh />} />
                <Route path="addproduct" element={<AddProduct />} />
                <Route path="calender" element={<Calendar />} />
                <Route path="changelogoandname" element={<LogoandName />} />
                <Route path="addsliderdata" element={<AddSliderData />} />
                <Route path="mycurrentproducts" element={<MyProduct />} />
                <Route path="editproduct/:productId" element={<EditProduct />} />
                <Route path="orderstatus" element={<AllOrder />} />
                <Route path="messages" element={<CustomerContact />} />
                <Route path="confirmorder" element={<UpdateOrderStatus />} />
                <Route path="campaign" element={<Campaign />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;