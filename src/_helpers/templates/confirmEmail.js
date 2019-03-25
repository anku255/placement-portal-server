exports.confirmEmailTemplate = (hostUrl, email, name, token) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Confirm your Placement Portal Account</title>
  </head>

  <body>
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="background: #f5f8fa; min-width: 350px; font-size: 1px; line-height: normal;"
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="750"
            class="table750"
            style="width: 100%; max-width: 750px; min-width: 350px; background: #f5f8fa;"
          >
            <tr>
              <td
                class="mob_pad"
                width="25"
                style="width: 25px; max-width: 25px; min-width: 25px;"
              >
                &nbsp;
              </td>
              <td align="center" valign="top" style="background: #ffffff;">
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                  style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f5f8fa;"
                >
                  <tr>
                    <td align="right" valign="top">
                      <div
                        class="top_pad"
                        style="height: 25px; line-height: 25px; font-size: 23px;"
                      >
                        &nbsp;
                      </div>
                    </td>
                  </tr>
                </table>

                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="88%"
                  style="width: 88% !important; min-width: 88%; max-width: 88%;"
                >
                  <tr>
                    <td align="center" valign="top">
                      <div
                        style="height: 40px; line-height: 40px; font-size: 38px;"
                      >
                        &nbsp;
                      </div>
                      <a href="#" style="display: block; max-width: 192px;">
                        <img
                          src="https://i.imgur.com/th7XaV9.png"
                          alt="Placement Portal"
                          width="192"
                          border="0"
                          style="display: block; width: 192px;"
                        />
                      </a>
                      <div
                        class="top_pad2"
                        style="height: 48px; line-height: 48px; font-size: 46px;"
                      >
                        &nbsp;
                      </div>
                    </td>
                  </tr>
                </table>

                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="88%"
                  style="width: 88% !important; min-width: 88%; max-width: 88%;"
                >
                  <tr>
                    <td align="left" valign="top">
                      <font
                        face="'Source Sans Pro', sans-serif"
                        color="#1a1a1a"
                        style="font-size: 52px; line-height: 54px; font-weight: 300; letter-spacing: -1.5px;"
                      >
                        <span
                          style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 52px; line-height: 54px; font-weight: 300; letter-spacing: -1.5px;"
                          >Confirm Your Email</span
                        >
                      </font>

                      <div
                        style="height: 21px; line-height: 21px; font-size: 19px;"
                      >
                        &nbsp;
                      </div>
                      <font
                        face="'Source Sans Pro', sans-serif"
                        color="#000000"
                        style="font-size: 20px; line-height: 28px;"
                      >
                        <span
                          style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #000000; font-size: 20px; line-height: 28px;"
                        >
                          Hey ${name},
                        </span>
                      </font>

                      <div
                        style="height: 6px; line-height: 6px; font-size: 4px;"
                      >
                        &nbsp;
                      </div>
                      <font
                        face="'Source Sans Pro', sans-serif"
                        color="#000000"
                        style="font-size: 20px; line-height: 28px;"
                      >
                        <span
                          style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #000000; font-size: 20px; line-height: 28px;"
                        >
                          We received a request to set your Placement Portal email to
                          ${email}. If this is correct, please confirm by
                          clicking the button below.
                        </span>
                      </font>

                      <div
                        style="height: 30px; line-height: 30px; font-size: 28px;"
                      >
                        &nbsp;
                      </div>
                      <table
                        class="mob_btn"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="background: #6070E9; border-radius: 4px;"
                      >
                        <tr>
                          <td align="center" valign="top">
                            <a
                              href="http://${hostUrl}/api/users/confirmation/${token}"
                              target="_blank"
                              style="display: block; border: 1px solid #6070E9; border-radius: 4px; padding: 19px 27px; font-family: 'Source Sans Pro', Arial, Verdana, Tahoma, Geneva, sans-serif; color: #ffffff; font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;"
                            >
                              <font
                                face="'Source Sans Pro', sans-serif"
                                color="#ffffff"
                                style="font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;"
                              >
                                <span
                                  style="font-family: 'Source Sans Pro', Arial, Verdana, Tahoma, Geneva, sans-serif; color: #ffffff; font-size: 26px; line-height: 30px; text-decoration: none; white-space: nowrap; font-weight: 600;"
                                  >Confirm Email</span
                                >
                              </font>
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div
                        style="height: 90px; line-height: 90px; font-size: 88px;"
                      >
                        &nbsp;
                      </div>
                    </td>
                  </tr>
                </table>

                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="90%"
                  style="width: 90% !important; min-width: 90%; max-width: 90%; border-width: 1px; border-style: solid; border-color: #e8e8e8; border-bottom: none; border-left: none; border-right: none;"
                >
                  <tr>
                    <td align="left" valign="top">
                      <div
                        style="height: 28px; line-height: 28px; font-size: 26px;"
                      >
                        &nbsp;
                      </div>
                    </td>
                  </tr>
                </table>

                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="88%"
                  style="width: 88% !important; min-width: 88%; max-width: 88%;"
                >
                  <tr>
                    <td align="left" valign="top">
                      <font
                        face="'Source Sans Pro', sans-serif"
                        color="#7f7f7f"
                        style="font-size: 17px; line-height: 23px;"
                      >
                        <span
                          style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #7f7f7f; font-size: 17px; line-height: 23px;"
                          >Once you confirm, all future messages about your
                          Placement Portal account will be sent to ${email}.</span
                        >
                      </font>

                      <div
                        style="height: 30px; line-height: 30px; font-size: 28px;"
                      >
                        &nbsp;
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="height: 34px; line-height: 34px; font-size: 32px;">
                  &nbsp;
                </div>
                <font
                  face="'Source Sans Pro', sans-serif"
                  color="#868686"
                  style="font-size: 15px; line-height: 20px;"
                >
                  <span
                    style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #868686; font-size: 15px; line-height: 20px;"
                  >
                    Placement Cell, IIIT Kalyani
                    <br />
                    Webel IT Park, Kalyani, Nadia</span
                  >
                </font>

                <div style="height: 4px; line-height: 4px; font-size: 2px;">
                  &nbsp;
                </div>
                <div style="height: 3px; line-height: 3px; font-size: 1px;">
                  &nbsp;
                </div>

                <div style="height: 35px; line-height: 35px; font-size: 33px;">
                  &nbsp;
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`;
